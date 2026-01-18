# Backend Implementation Specifications
## TaxClarity NG - Django REST API

This document provides the exact implementation details for the Django backend.

---

## Setup Requirements

### Install Dependencies
```bash
pip install django djangorestframework django-cors-headers
```

### Add to settings.py
```python
INSTALLED_APPS = [
    # ... default apps
    'rest_framework',
    'corsheaders',
    'App',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at the top
    # ... other middleware
]

# Allow frontend to connect
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
    "exp://192.168.1.100:8081",  # Expo Go
]

# Or for development:
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # For MVP, open access
    ],
}
```

---

## Models (App/models.py)

```python
from django.db import models
import uuid

class UserProfile(models.Model):
    """User tax profile - stores user classification for personalized tax info"""

    USER_TYPE_CHOICES = [
        ('salary_earner', 'Salary Earner'),
        ('freelancer', 'Freelancer / Self-Employed'),
        ('small_business_owner', 'Small Business Owner'),
    ]

    # Updated income ranges based on NTA 2025 tax brackets
    INCOME_RANGE_CHOICES = [
        ('below_800k', 'Below ₦800,000 (Tax-Free)'),
        ('800k_3m', '₦800,000 - ₦3,000,000'),
        ('3m_12m', '₦3,000,000 - ₦12,000,000'),
        ('12m_25m', '₦12,000,000 - ₦25,000,000'),
        ('25m_50m', '₦25,000,000 - ₦50,000,000'),
        ('above_50m', 'Above ₦50,000,000'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=30, choices=USER_TYPE_CHOICES)
    income_range = models.CharField(max_length=20, choices=INCOME_RANGE_CHOICES)
    state = models.CharField(max_length=50)  # Nigerian state - determines SIRS (e.g., LIRS for Lagos)
    is_incorporated = models.BooleanField(default=False)  # For small business: sole prop vs company
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user_type} - {self.state}"


class TaxRule(models.Model):
    """Tax rules for 2026 reforms"""

    name = models.CharField(max_length=100)  # e.g., "Personal Income Tax"
    description = models.TextField()
    simplified_explanation = models.TextField()  # Plain language version
    applies_to = models.JSONField(default=list)  # ['salary_earner', 'freelancer']
    min_income_threshold = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    rate_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ChecklistItem(models.Model):
    """Compliance checklist items"""

    PRIORITY_CHOICES = [
        (1, 'High'),
        (2, 'Medium'),
        (3, 'Low'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='checklist_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'priority']

    def __str__(self):
        return self.title


class Reminder(models.Model):
    """User reminders for tax deadlines"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    reminder_date = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reminder_date']

    def __str__(self):
        return f"{self.title} - {self.reminder_date}"
```

---

## Serializers (App/serializers.py)

```python
from rest_framework import serializers
from .models import UserProfile, TaxRule, ChecklistItem, Reminder


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user_type', 'income_range', 'state', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRule
        fields = ['id', 'name', 'description', 'simplified_explanation',
                  'applies_to', 'min_income_threshold', 'rate_percentage',
                  'effective_date', 'is_active']


class TaxCheckRequestSerializer(serializers.Serializer):
    """For POST /api/tax/check/"""
    user_type = serializers.ChoiceField(choices=['salary_earner', 'freelancer', 'small_business_owner'])
    income_range = serializers.CharField()
    state = serializers.CharField()


class TaxCheckResultSerializer(serializers.Serializer):
    """Response for tax check"""
    applicable = serializers.BooleanField()
    tax_type = serializers.CharField()
    description = serializers.CharField()
    rate = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'title', 'description', 'completed', 'due_date', 'priority', 'order']
        read_only_fields = ['id']


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'title', 'description', 'reminder_date', 'is_sent', 'created_at']
        read_only_fields = ['id', 'is_sent', 'created_at']
```

---

## Views (App/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import UserProfile, TaxRule, ChecklistItem, Reminder
from .serializers import (
    UserProfileSerializer, TaxRuleSerializer, TaxCheckRequestSerializer,
    ChecklistItemSerializer, ReminderSerializer
)


# ==================== USER PROFILE ====================

class CreateProfileView(APIView):
    """POST /api/profile/create/"""

    def post(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            # Auto-generate checklist for new user
            self._create_default_checklist(profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _create_default_checklist(self, profile):
        """Generate default checklist based on user type"""
        checklist_items = [
            {"title": "Register for Tax Identification Number (TIN)", "priority": 1, "order": 1},
            {"title": "Gather income documentation", "priority": 1, "order": 2},
            {"title": "Calculate annual income", "priority": 2, "order": 3},
            {"title": "Identify applicable deductions", "priority": 2, "order": 4},
            {"title": "Set filing deadline reminder", "priority": 2, "order": 5},
        ]

        # Add user-type specific items
        if profile.user_type == 'freelancer':
            checklist_items.append({"title": "Track business expenses", "priority": 1, "order": 6})
        elif profile.user_type == 'small_business_owner':
            checklist_items.append({"title": "Register for VAT (if applicable)", "priority": 1, "order": 6})
            checklist_items.append({"title": "Set up business accounting", "priority": 2, "order": 7})

        for item in checklist_items:
            ChecklistItem.objects.create(user_profile=profile, **item)


class ProfileDetailView(APIView):
    """GET/PUT /api/profile/<user_id>/"""

    def get(self, request, user_id):
        profile = get_object_or_404(UserProfile, id=user_id)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, user_id):
        profile = get_object_or_404(UserProfile, id=user_id)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== TAX INFORMATION ====================

class TaxCheckView(APIView):
    """POST /api/tax/check/"""

    def post(self, request):
        serializer = TaxCheckRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_type = serializer.validated_data['user_type']
        income_range = serializer.validated_data['income_range']

        # Get applicable tax rules
        applicable_rules = TaxRule.objects.filter(
            is_active=True,
            applies_to__contains=user_type
        )

        # Convert income range to threshold check
        income_thresholds = {
            'below_400k': 400000,
            '400k_700k': 700000,
            '700k_1m': 1000000,
            '1m_2m': 2000000,
            'above_2m': 5000000,
        }
        user_income = income_thresholds.get(income_range, 0)

        results = []
        for rule in applicable_rules:
            applicable = user_income >= rule.min_income_threshold
            results.append({
                'applicable': applicable,
                'tax_type': rule.name,
                'description': rule.simplified_explanation if applicable else f"Not applicable - income below ₦{rule.min_income_threshold:,.0f} threshold",
                'rate': float(rule.rate_percentage) if rule.rate_percentage else None,
            })

        return Response(results)


class TaxExplanationView(APIView):
    """GET /api/tax/explanation/"""

    def get(self, request):
        tax_type = request.query_params.get('tax_type', None)

        if tax_type:
            rule = get_object_or_404(TaxRule, name__iexact=tax_type, is_active=True)
            return Response({
                'title': rule.name,
                'summary': rule.simplified_explanation,
                'details': rule.description.split('\n'),
                'rate': float(rule.rate_percentage) if rule.rate_percentage else None,
            })

        # Return all active rules
        rules = TaxRule.objects.filter(is_active=True)
        explanations = []
        for rule in rules:
            explanations.append({
                'title': rule.name,
                'summary': rule.simplified_explanation,
                'details': rule.description.split('\n'),
                'rate': float(rule.rate_percentage) if rule.rate_percentage else None,
            })

        return Response(explanations)


class TaxRulesView(APIView):
    """GET /api/tax/rules/"""

    def get(self, request):
        rules = TaxRule.objects.filter(is_active=True)
        serializer = TaxRuleSerializer(rules, many=True)
        return Response(serializer.data)


# ==================== COMPLIANCE CHECKLIST ====================

class ChecklistView(APIView):
    """GET /api/checklist/"""

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = get_object_or_404(UserProfile, id=user_id)
        items = profile.checklist_items.all()
        serializer = ChecklistItemSerializer(items, many=True)
        return Response(serializer.data)


class ChecklistItemDetailView(APIView):
    """PATCH /api/checklist/<item_id>/"""

    def patch(self, request, item_id):
        item = get_object_or_404(ChecklistItem, id=item_id)
        serializer = ChecklistItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== REMINDERS ====================

class ReminderListView(APIView):
    """GET/POST /api/reminders/"""

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = get_object_or_404(UserProfile, id=user_id)
        reminders = profile.reminders.filter(is_sent=False)
        serializer = ReminderSerializer(reminders, many=True)
        return Response(serializer.data)

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = get_object_or_404(UserProfile, id=user_id)
        serializer = ReminderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user_profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReminderDetailView(APIView):
    """DELETE /api/reminders/<id>/"""

    def delete(self, request, reminder_id):
        reminder = get_object_or_404(Reminder, id=reminder_id)
        reminder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

---

## URLs (App/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # User Profile
    path('profile/create/', views.CreateProfileView.as_view(), name='create-profile'),
    path('profile/<uuid:user_id>/', views.ProfileDetailView.as_view(), name='profile-detail'),

    # Tax Information
    path('tax/check/', views.TaxCheckView.as_view(), name='tax-check'),
    path('tax/explanation/', views.TaxExplanationView.as_view(), name='tax-explanation'),
    path('tax/rules/', views.TaxRulesView.as_view(), name='tax-rules'),

    # Compliance Checklist
    path('checklist/', views.ChecklistView.as_view(), name='checklist'),
    path('checklist/<uuid:item_id>/', views.ChecklistItemDetailView.as_view(), name='checklist-item'),

    # Reminders
    path('reminders/', views.ReminderListView.as_view(), name='reminders'),
    path('reminders/<uuid:reminder_id>/', views.ReminderDetailView.as_view(), name='reminder-detail'),
]
```

---

## Main URLs (taxclarity/urls.py)

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('App.urls')),
]
```

---

## Seed Data (for testing)

Create a management command or run in Django shell:

```python
from App.models import TaxRule
from datetime import date

# ============================================================
# TAX RULES BASED ON NIGERIA TAX ACT 2025 (NTA)
# AND NIGERIA TAX ADMINISTRATION ACT 2025 (NTAA)
# Effective: January 1, 2026
# ============================================================

# Personal Income Tax (PIT) - Progressive Rates
# Reference: NTA 2025 - applies to individuals
TaxRule.objects.create(
    name="Personal Income Tax (PIT)",
    description="""Tax on personal income from employment, business, or investments.
Progressive rates under NTA 2025:
• ₦0 - ₦800,000: 0% (Tax-Free)
• ₦800,001 - ₦3,000,000: 15%
• ₦3,000,001 - ₦12,000,000: 18%
• ₦12,000,001 - ₦25,000,000: 21%
• ₦25,000,001 - ₦50,000,000: 23%
• Above ₦50,000,000: 25%
Deductions: Pension (up to 25% of salary), NHF, rent relief (20% up to ₦500,000).""",
    simplified_explanation="Good news! The first ₦800,000 you earn yearly is completely tax-free. Above that, you pay 15-25% depending on how much you earn. You can reduce your tax by claiming deductions for pension, housing fund, and rent payments.",
    applies_to=["salary_earner", "freelancer", "small_business_owner"],
    min_income_threshold=800000,
    rate_percentage=15.00,
    effective_date=date(2026, 1, 1),
)

# Pay As You Earn (PAYE) - For Salary Earners
TaxRule.objects.create(
    name="Pay As You Earn (PAYE)",
    description="""Tax deducted from salary by employer.
• Employer deducts monthly and remits to State IRS (e.g., LIRS for Lagos) by 10th of following month.
• Uses same progressive PIT rates.
• Employee receives net salary after deduction.
• Employer provides annual tax deduction certificate.
Reference: Section 14 NTAA 2025.""",
    simplified_explanation="Your employer handles this for you! They deduct tax from your salary each month and send it to the tax office (like LIRS if you're in Lagos). Just verify your payslip shows correct deductions. You usually don't need to file separately unless you have other income.",
    applies_to=["salary_earner"],
    min_income_threshold=800000,
    rate_percentage=15.00,
    effective_date=date(2026, 1, 1),
)

# Withholding Tax (WHT) - For Freelancers
TaxRule.objects.create(
    name="Withholding Tax (WHT)",
    description="""Tax deducted at source from payments to freelancers/contractors.
• Rates: 5-10% depending on service type.
• Deducted by clients before payment.
• Can be credited against final PIT liability.
• Request WHT certificate from clients to claim credit.
Reference: NTAA 2025.""",
    simplified_explanation="When clients pay you for freelance work, they may deduct 5-10% as withholding tax before sending your payment. This isn't extra tax - you can use these deductions as credit when filing your annual tax return. Always ask clients for WHT certificates!",
    applies_to=["freelancer"],
    min_income_threshold=0,
    rate_percentage=5.00,
    effective_date=date(2026, 1, 1),
)

# Value Added Tax (VAT)
TaxRule.objects.create(
    name="Value Added Tax (VAT)",
    description="""Tax on goods and services sold by businesses.
• Rate: 7.5%
• Applies ONLY if annual turnover exceeds ₦50 million.
• Small businesses (≤ ₦50 million turnover) are EXEMPT.
• If applicable, file monthly returns by 21st of following month.
Reference: Section 22 NTAA 2025.""",
    simplified_explanation="If your business makes more than ₦50 million per year, you must register for VAT, charge 7.5% on sales, and file monthly returns. But if you earn less than ₦50 million, you're completely exempt from VAT - no registration needed!",
    applies_to=["small_business_owner", "freelancer"],
    min_income_threshold=50000000,
    rate_percentage=7.50,
    effective_date=date(2026, 1, 1),
)

# Company Income Tax (CIT) - For Incorporated Businesses
TaxRule.objects.create(
    name="Company Income Tax (CIT)",
    description="""Tax on profits of incorporated companies.
• Small Companies (turnover ≤ ₦50 million, assets ≤ ₦250 million): 0% CIT
• Medium/Large Companies: 30% CIT + 4% Development Levy
• Must file within 6 months of financial year end.
• Owner still pays PIT on dividends/salary taken.
Reference: NTA 2025, Section 11 NTAA.""",
    simplified_explanation="Great news for small businesses! If your company makes less than ₦50 million and has assets under ₦250 million, you pay 0% company tax. Larger companies pay 30%. Note: Even with 0% CIT, you personally still pay income tax on any salary or dividends you take.",
    applies_to=["small_business_owner"],
    min_income_threshold=50000000,
    rate_percentage=0.00,
    effective_date=date(2026, 1, 1),
)

# Self-Assessment Requirement
TaxRule.objects.create(
    name="Self-Assessment Filing",
    description="""All taxpayers must self-assess their tax liability.
• Salary earners with only PAYE income may not need to file.
• Self-employed/freelancers MUST file annual returns.
• Deadline: March 31 annually.
• File via State IRS portal (e.g., etax.lirs.net for Lagos).
Reference: Section 34 NTAA 2025, Section 13 NTAA.""",
    simplified_explanation="If you're self-employed or have income beyond your salary, you need to file your own tax return by March 31st each year. Calculate your income, subtract expenses and deductions, then pay any tax owed. Use your state's online portal (like LIRS e-Tax for Lagos residents).",
    applies_to=["freelancer", "small_business_owner"],
    min_income_threshold=0,
    rate_percentage=0.00,
    effective_date=date(2026, 1, 1),
)

print("✅ Tax rules created successfully based on NTA/NTAA 2025!")
```

---

## Tax Calculation Helper

Add this utility function to help calculate tax:

```python
# utils.py - Tax Calculator based on NTA 2025

def calculate_pit(annual_income: float, deductions: float = 0) -> dict:
    """
    Calculate Personal Income Tax based on NTA 2025 progressive rates.
    
    Args:
        annual_income: Gross annual income in Naira
        deductions: Total deductions (pension, NHF, rent relief, etc.)
    
    Returns:
        dict with tax breakdown
    """
    taxable_income = max(0, annual_income - deductions)
    
    # NTA 2025 Tax Brackets
    brackets = [
        (800000, 0.00),      # First ₦800,000 at 0%
        (2200000, 0.15),     # ₦800,001 - ₦3,000,000 at 15%
        (9000000, 0.18),     # ₦3,000,001 - ₦12,000,000 at 18%
        (13000000, 0.21),    # ₦12,000,001 - ₦25,000,000 at 21%
        (25000000, 0.23),    # ₦25,000,001 - ₦50,000,000 at 23%
        (float('inf'), 0.25) # Above ₦50,000,000 at 25%
    ]
    
    tax = 0
    remaining = taxable_income
    breakdown = []
    cumulative = 0
    
    for bracket_size, rate in brackets:
        if remaining <= 0:
            break
        taxable_in_bracket = min(remaining, bracket_size)
        tax_in_bracket = taxable_in_bracket * rate
        tax += tax_in_bracket
        
        if taxable_in_bracket > 0:
            breakdown.append({
                'bracket': f'₦{cumulative:,.0f} - ₦{cumulative + bracket_size:,.0f}',
                'rate': f'{rate * 100:.0f}%',
                'amount_taxed': taxable_in_bracket,
                'tax': tax_in_bracket
            })
        
        remaining -= bracket_size
        cumulative += bracket_size
    
    return {
        'gross_income': annual_income,
        'deductions': deductions,
        'taxable_income': taxable_income,
        'total_tax': tax,
        'effective_rate': (tax / annual_income * 100) if annual_income > 0 else 0,
        'breakdown': breakdown
    }

# Example usage:
# calculate_pit(5000000, 500000)  # ₦5M income with ₦500K deductions
```

---

## Enhanced Checklist Items

Update the `_create_default_checklist` method in views.py with accurate NTA/NTAA 2025 requirements:

```python
def _create_default_checklist(self, profile):
    """
    Generate comprehensive checklist based on user type.
    Based on Nigeria Tax Act 2025 and Nigeria Tax Administration Act 2025.
    """

    # Common items for everyone
    common_items = [
        {
            "title": "Register for Tax ID (TIN)",
            "description": "Visit taxid.jrb.gov.ng - you need BVN, NIN, date of birth, and proof of address. Penalty for non-registration: ₦50,000 (Section 100 NTAA).",
            "priority": 1,
            "order": 1
        },
        {
            "title": "Gather all income documents for 2025",
            "description": "Collect payslips, invoices, bank statements, and payment receipts from January to December 2025.",
            "priority": 1,
            "order": 2
        },
        {
            "title": "Calculate your total annual income",
            "description": "Add up all income sources. Remember: first ₦800,000 is tax-free under NTA 2025!",
            "priority": 2,
            "order": 3
        },
        {
            "title": "Identify allowable deductions",
            "description": "Pension (up to 25% of salary), NHF contributions, rent relief (20% of rent up to ₦500,000), life insurance premiums.",
            "priority": 2,
            "order": 4
        },
        {
            "title": "Keep records for 6 years",
            "description": "Maintain all tax-related documents for 6 years as required by Section 31 NTAA. Update any changes within 30 days (Section 9).",
            "priority": 3,
            "order": 5
        },
    ]

    # Salary earner specific - PAYE handled by employer
    salary_items = [
        {
            "title": "Verify monthly PAYE deductions on payslip",
            "description": "Check that your employer is correctly deducting tax. They must remit to your State IRS (e.g., LIRS) by the 10th of each month (Section 14 NTAA).",
            "priority": 1,
            "order": 6
        },
        {
            "title": "Request annual tax deduction certificate",
            "description": "Get this from HR/Payroll to confirm total tax paid. Useful if you need a Tax Clearance Certificate.",
            "priority": 2,
            "order": 7
        },
        {
            "title": "File annual return if you have other income",
            "description": "If you have rental income, investments, or side business, file Form A by March 31 via your State IRS portal (e.g., etax.lirs.net for Lagos).",
            "priority": 2,
            "order": 8
        },
        {
            "title": "Apply for Tax Clearance Certificate (TCC)",
            "description": "Required for certain transactions (Section 72 NTAA). Apply via your State IRS portal after ensuring all taxes are paid.",
            "priority": 3,
            "order": 9
        },
    ]

    # Freelancer / Self-employed specific
    freelancer_items = [
        {
            "title": "Track all business expenses with receipts",
            "description": "Equipment, data/internet, marketing, transport, workspace costs - all deductible from your income before tax calculation.",
            "priority": 1,
            "order": 6
        },
        {
            "title": "Set aside 15-20% of each payment for taxes",
            "description": "Based on NTA 2025 rates, save money for your tax bill. Better to have extra than fall short!",
            "priority": 1,
            "order": 7
        },
        {
            "title": "Collect WHT certificates from all clients",
            "description": "When clients deduct 5-10% withholding tax, request the certificate. You can credit this against your final tax bill.",
            "priority": 1,
            "order": 8
        },
        {
            "title": "Convert foreign income to Naira",
            "description": "If paid in USD/GBP, convert to Naira for tax purposes. Keep records of exchange rates used.",
            "priority": 2,
            "order": 9
        },
        {
            "title": "File self-assessment return (Form A) by March 31",
            "description": "Access etax.lirs.net (Lagos) or your State IRS portal. Self-assess per Section 34 NTAA. Late filing: ₦100,000 + ₦10,000/month (Section 101).",
            "priority": 1,
            "order": 10
        },
        {
            "title": "Check if VAT registration required",
            "description": "Only if annual turnover exceeds ₦50 million. Below this, you're exempt (NTA 2025).",
            "priority": 2,
            "order": 11
        },
    ]

    # Small business owner specific
    business_items = [
        {
            "title": "Determine your business structure for tax",
            "description": "Sole proprietorship/partnership = PIT (personal income tax). Registered company = CIT (company income tax).",
            "priority": 1,
            "order": 6
        },
        {
            "title": "Register business with tax authority",
            "description": "Companies register with NRS (Nigeria Revenue Service). Sole proprietors register with State IRS. Get Tax ID at taxid.jrb.gov.ng.",
            "priority": 1,
            "order": 7
        },
        {
            "title": "Check if you qualify as 'Small Company' (0% CIT)",
            "description": "If incorporated and turnover ≤ ₦50 million + fixed assets ≤ ₦250 million, you pay 0% company tax under NTA 2025!",
            "priority": 1,
            "order": 8
        },
        {
            "title": "Set up proper bookkeeping",
            "description": "Keep financial records, invoices, receipts. Needed for tax returns and potential audits (Section 64 NTAA).",
            "priority": 1,
            "order": 9
        },
        {
            "title": "Check VAT registration requirement",
            "description": "If turnover > ₦50 million, register for VAT and charge 7.5% on sales. File monthly by 21st. Below ₦50M = exempt.",
            "priority": 1,
            "order": 10
        },
        {
            "title": "File annual tax return",
            "description": "PIT: March 31 deadline. CIT: Within 6 months of financial year end (Section 11 NTAA). Late CIT filing: ₦10 million + daily penalties (Section 128).",
            "priority": 1,
            "order": 11
        },
        {
            "title": "Pay personal tax on salary/dividends taken",
            "description": "Even with 0% CIT, you personally pay PIT on money you take from the business as salary or dividends.",
            "priority": 2,
            "order": 12
        },
    ]

    # Build checklist based on user type
    checklist = common_items.copy()

    if profile.user_type == 'salary_earner':
        checklist.extend(salary_items)
    elif profile.user_type == 'freelancer':
        checklist.extend(freelancer_items)
    elif profile.user_type == 'small_business_owner':
        checklist.extend(business_items)

    # Create all items in database
    for item in checklist:
        ChecklistItem.objects.create(user_profile=profile, **item)
```

---

## Key Tax Deadlines (NTA/NTAA 2025)

| Deadline | Description | Applies To | Reference |
|----------|-------------|------------|-----------|
| **10th of each month** | Employer remits PAYE to State IRS | Employers | Section 14 NTAA |
| **21st of each month** | VAT returns due | VAT-registered (>₦50M) | Section 22 NTAA |
| **March 31** | Individual PIT filing deadline | All individuals | Section 13 NTAA |
| **6 months after year-end** | Company Income Tax return | Companies | Section 11 NTAA |
| **30 days** | Update any profile changes | Everyone | Section 9 NTAA |

---

## Penalties Reference (NTAA 2025)

| Violation | Penalty | Section |
|-----------|---------|---------|
| Failure to register for Tax ID | ₦50,000 | Section 100 |
| Late filing of return | ₦100,000 + ₦10,000/month | Section 101 |
| Employer non-deduction of PAYE | 40% of amount | Section 105 |
| Non-remittance of tax | 10% + interest | Section 107 |
| Late CIT filing | ₦10 million + daily penalty | Section 128 |
| General non-compliance | ₦1 million + imprisonment | Section 127 |

---

## Key Resources & Portals

| Portal | URL | Purpose |
|--------|-----|---------|
| Tax ID Registration | taxid.jrb.gov.ng | Get your TIN |
| Lagos IRS (LIRS) | etax.lirs.net | File PIT for Lagos residents |
| NRS (formerly FIRS) | firs.gov.ng | Company taxes, NRS portal |

---

## Testing the API

After running migrations and seeding data:

```bash
# Create profile (updated income ranges)
curl -X POST http://localhost:8000/api/profile/create/ \
  -H "Content-Type: application/json" \
  -d '{"user_type": "freelancer", "income_range": "3m_12m", "state": "Lagos"}'

# Check taxes
curl -X POST http://localhost:8000/api/tax/check/ \
  -H "Content-Type: application/json" \
  -d '{"user_type": "freelancer", "income_range": "3m_12m", "state": "Lagos"}'

# Get checklist
curl "http://localhost:8000/api/checklist/?user_id=<user-uuid>"
```

---

## Quick Start Commands

```bash
cd backend/taxclarity

# Install dependencies
pip install django djangorestframework django-cors-headers

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (for admin)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

---

*This document is based on the Nigeria Tax Act 2025 and Nigeria Tax Administration Act 2025, effective January 1, 2026.*

*This document should be shared with your backend collaborator*

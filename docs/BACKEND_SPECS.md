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
        ('freelancer', 'Freelancer'),
        ('small_business_owner', 'Small Business Owner'),
    ]

    INCOME_RANGE_CHOICES = [
        ('below_400k', 'Below ₦400,000'),
        ('400k_700k', '₦400,000 - ₦700,000'),
        ('700k_1m', '₦700,000 - ₦1,000,000'),
        ('1m_2m', '₦1,000,000 - ₦2,000,000'),
        ('above_2m', 'Above ₦2,000,000'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=30, choices=USER_TYPE_CHOICES)
    income_range = models.CharField(max_length=20, choices=INCOME_RANGE_CHOICES)
    state = models.CharField(max_length=50)  # Nigerian state
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

# ============ TAX RULES FOR 2026 REFORMS ============

# Personal Income Tax
TaxRule.objects.create(
    name="Personal Income Tax (PIT)",
    description="Tax on personal income from employment, business, or investments.\nApplies to all income earners in Nigeria.\nRates range from 7% to 24% based on income brackets.\n2026 Reform: First ₦800,000 is now tax-free (previously ₦300,000).",
    simplified_explanation="This is the main tax on your income. If you earn above ₦800,000 per year, you need to pay this tax. The more you earn, the higher percentage you pay. Good news: The 2026 reform increased the tax-free threshold!",
    applies_to=["salary_earner", "freelancer", "small_business_owner"],
    min_income_threshold=800000,
    rate_percentage=7.00,
    effective_date=date(2026, 1, 1),
)

# Value Added Tax
TaxRule.objects.create(
    name="Value Added Tax (VAT)",
    description="Tax on goods and services.\nApplies to businesses with annual turnover above ₦25 million.\nStandard rate is 7.5%.\nSome essential items are VAT-exempt.",
    simplified_explanation="If your business sells goods or services and makes more than ₦25 million per year, you need to register for VAT and charge 7.5% on your sales.",
    applies_to=["small_business_owner"],
    min_income_threshold=25000000,
    rate_percentage=7.50,
    effective_date=date(2026, 1, 1),
)

# Withholding Tax
TaxRule.objects.create(
    name="Withholding Tax (WHT)",
    description="Tax deducted at source from payments.\nApplies to freelancers and contractors.\nRates vary from 5% to 10% depending on service type.\nCan be used as credit against final tax.",
    simplified_explanation="When clients pay you for services, they may deduct 5-10% as withholding tax and send it to the government. You can claim this as credit against your income tax.",
    applies_to=["freelancer"],
    min_income_threshold=0,
    rate_percentage=5.00,
    effective_date=date(2026, 1, 1),
)

# Company Income Tax (for small business owners who registered companies)
TaxRule.objects.create(
    name="Company Income Tax (CIT)",
    description="Tax on company profits.\nSmall companies (turnover < ₦25m): 0% rate.\nMedium companies (₦25m-₦100m): 20% rate.\nLarge companies (> ₦100m): 30% rate.",
    simplified_explanation="If you registered your business as a company, you pay tax on your profits. Small businesses with less than ₦25 million turnover pay 0% - that's great news for startups!",
    applies_to=["small_business_owner"],
    min_income_threshold=25000000,
    rate_percentage=20.00,
    effective_date=date(2026, 1, 1),
)

# PAYE (Pay As You Earn)
TaxRule.objects.create(
    name="Pay As You Earn (PAYE)",
    description="Tax deducted from salary by employer.\nEmployer remits to tax authority monthly.\nApplies to all formal employment.\nEmployee receives net salary after deduction.",
    simplified_explanation="If you work for a company, your employer automatically deducts tax from your salary and sends it to the government. You don't need to do anything - it's already handled!",
    applies_to=["salary_earner"],
    min_income_threshold=800000,
    rate_percentage=7.00,
    effective_date=date(2026, 1, 1),
)

# Tertiary Education Tax
TaxRule.objects.create(
    name="Tertiary Education Tax (TET)",
    description="Tax to fund tertiary education.\nApplies to companies only.\nRate: 2.5% of assessable profits.\nDoes not apply to individuals.",
    simplified_explanation="This is a 2.5% tax on company profits that goes to fund universities. Only applies if you registered your business as a company.",
    applies_to=["small_business_owner"],
    min_income_threshold=25000000,
    rate_percentage=2.50,
    effective_date=date(2026, 1, 1),
)

print("✅ Tax rules created successfully!")
```

---

## Enhanced Checklist Items

Update the `_create_default_checklist` method in views.py with more detailed items:

```python
def _create_default_checklist(self, profile):
    """Generate comprehensive checklist based on user type"""
    
    # Common items for everyone
    common_items = [
        {
            "title": "Get your Tax Identification Number (TIN)",
            "description": "Visit the nearest FIRS office or apply online at taxpromax.firs.gov.ng",
            "priority": 1,
            "order": 1
        },
        {
            "title": "Gather all income documents",
            "description": "Collect payslips, invoices, bank statements from Jan-Dec 2025",
            "priority": 1,
            "order": 2
        },
        {
            "title": "Calculate your total annual income",
            "description": "Add up all income sources: salary, freelance, investments, etc.",
            "priority": 2,
            "order": 3
        },
        {
            "title": "Identify your tax-deductible expenses",
            "description": "Pension contributions, NHF, life insurance premiums can reduce your tax",
            "priority": 2,
            "order": 4
        },
        {
            "title": "Check the 2026 tax-free threshold",
            "description": "First ₦800,000 is now exempt - calculate if you owe any tax",
            "priority": 2,
            "order": 5
        },
    ]
    
    # Salary earner specific
    salary_items = [
        {
            "title": "Confirm PAYE deductions with employer",
            "description": "Request your annual tax deduction certificate from HR",
            "priority": 1,
            "order": 6
        },
        {
            "title": "File annual tax returns (if required)",
            "description": "Due by March 31st if you have additional income sources",
            "priority": 2,
            "order": 7
        },
    ]
    
    # Freelancer specific
    freelancer_items = [
        {
            "title": "Track all business expenses",
            "description": "Keep receipts for equipment, internet, transport, workspace costs",
            "priority": 1,
            "order": 6
        },
        {
            "title": "Set aside money for taxes",
            "description": "Save 10-15% of each payment for tax obligations",
            "priority": 1,
            "order": 7
        },
        {
            "title": "Collect WHT certificates from clients",
            "description": "Request withholding tax certificates to claim credits",
            "priority": 2,
            "order": 8
        },
        {
            "title": "File self-assessment tax return",
            "description": "Due by March 31st - use Form A for individuals",
            "priority": 1,
            "order": 9
        },
    ]
    
    # Small business owner specific
    business_items = [
        {
            "title": "Register your business for tax",
            "description": "Register with FIRS if not already done",
            "priority": 1,
            "order": 6
        },
        {
            "title": "Check if you need VAT registration",
            "description": "Required if annual turnover exceeds ₦25 million",
            "priority": 1,
            "order": 7
        },
        {
            "title": "Set up proper bookkeeping",
            "description": "Use accounting software to track income and expenses",
            "priority": 1,
            "order": 8
        },
        {
            "title": "File monthly VAT returns (if applicable)",
            "description": "Due by 21st of following month",
            "priority": 2,
            "order": 9
        },
        {
            "title": "File annual company tax return",
            "description": "Due within 6 months of financial year end",
            "priority": 1,
            "order": 10
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

## Key Tax Deadlines (2026)

Add this data for reminders:

| Deadline | Description | Applies To |
|----------|-------------|------------|
| January 31 | Employer submits annual PAYE returns | Salary Earners |
| March 31 | Individual self-assessment filing deadline | Freelancers, Business Owners |
| Monthly 21st | VAT returns due | VAT-registered Businesses |
| 6 months after year-end | Company tax return | Registered Companies |

---

## Testing the API

After running migrations and seeding data:

```bash
# Create profile
curl -X POST http://localhost:8000/api/profile/create/ \
  -H "Content-Type: application/json" \
  -d '{"user_type": "freelancer", "income_range": "700k_1m", "state": "Lagos"}'

# Check taxes
curl -X POST http://localhost:8000/api/tax/check/ \
  -H "Content-Type: application/json" \
  -d '{"user_type": "freelancer", "income_range": "700k_1m", "state": "Lagos"}'

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

*This document should be shared with your backend collaborator*

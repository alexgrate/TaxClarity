# Product Requirements Document (PRD)
## TaxClarity NG

---

## Problem Statement

Nigeria's 2026 tax reforms change how individuals, freelancers, and small businesses are taxed. Most people do not understand if the new rules apply to them, what has changed, or what actions are required to stay compliant. This confusion leads to missed obligations, penalties, and stress.

---

## Product Goal

Help Nigerians easily understand how the 2026 tax reforms apply to them and guide them step-by-step to remain tax compliant.

---

## Target Users

- **Individuals / Salary Earners** - Employed Nigerians earning regular income
- **Freelancers & Gig Workers** - Self-employed individuals with variable income
- **Small Business Owners** - Entrepreneurs running small to medium enterprises

---

## User Pain Points

| Pain Point | Description |
|------------|-------------|
| Confusing tax language | Legal jargon makes tax rules hard to understand |
| Uncertainty about exemptions | Users don't know what exemptions apply to them |
| Fear of penalties | Anxiety about non-compliance consequences |
| Lack of affordable guidance | Professional tax advice is expensive |

---

## Solution Overview

A simple, personalized tax clarity assistant that explains applicable tax rules in plain language and provides clear next steps.

---

## Key Features (MVP)

### 1. User Tax Profile Setup
- Collect user type (salary earner, freelancer, small business owner)
- Collect income range
- Collect state of residence
- Store profile for personalized experience

### 2. Tax Applicability Checker
- Analyze user profile against 2026 tax rules
- Determine which taxes apply to the user
- Show applicable tax rates and thresholds

### 3. Simplified Tax Explanation
- Plain language explanations of tax obligations
- Visual breakdowns of what changed in 2026
- Examples relevant to user's situation

### 4. Step-by-Step Action Guide (Compliance Checklist)
- Personalized checklist based on user profile
- Track completion status
- Priority ordering of actions

### 5. Basic Reminders & Alerts
- Tax deadline reminders
- Filing period notifications
- Checklist completion prompts

---

## Out of Scope (MVP)

- Tax payments processing
- Government portal integrations (FIRS, SIRS)
- Advanced tax calculations
- Document uploads
- Multi-user accounts

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding completion rate | > 80% |
| User understanding feedback | > 4.0/5.0 |
| Checklist completion rate | > 60% |

---

## Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native with Expo SDK 54
- **Navigation:** Expo Router (file-based)
- **State Management:** Zustand with AsyncStorage persistence
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **UI:** Custom components (no external UI library)

### Backend (API Server)
- **Framework:** Django 5.x with Django REST Framework
- **Database:** PostgreSQL (production) / SQLite (development)
- **Authentication:** Token-based (DRF TokenAuthentication)
- **API Format:** RESTful JSON API

### Deployment
- **Frontend:** Expo EAS Build → App Stores
- **Backend:** Railway / Render / AWS
- **Database:** Managed PostgreSQL

---

## API Endpoints Specification

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profile/create/` | Create new user profile |
| GET | `/api/profile/<user_id>/` | Get user profile |
| PUT | `/api/profile/<user_id>/` | Update user profile |

### Tax Information

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tax/check/` | Check applicable taxes |
| GET | `/api/tax/explanation/` | Get tax explanations |
| GET | `/api/tax/rules/` | Get all tax rules |

### Compliance Checklist

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checklist/` | Get user's checklist |
| PATCH | `/api/checklist/<item_id>/` | Update checklist item |

### Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders/` | Get user reminders |
| POST | `/api/reminders/` | Create reminder |
| DELETE | `/api/reminders/<id>/` | Delete reminder |

---

## Data Models

### UserProfile
```python
user_type: str  # 'salary_earner', 'freelancer', 'small_business_owner'
income_range: str  # 'below_400k', '400k_700k', '700k_1m', '1m_2m', 'above_2m'
state: str  # Nigerian state name
created_at: datetime
updated_at: datetime
```

### TaxRule
```python
name: str  # e.g., 'Personal Income Tax', 'VAT'
description: str
applies_to: list[str]  # user types this applies to
min_income: decimal  # minimum income threshold
rate: decimal  # tax rate percentage
effective_date: date
```

### ChecklistItem
```python
user: ForeignKey(UserProfile)
title: str
description: str
completed: bool
due_date: date (optional)
priority: int
```

### Reminder
```python
user: ForeignKey(UserProfile)
title: str
reminder_date: datetime
is_sent: bool
```

---

## Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| Week 1 | Research & PRD | ✅ PRD Complete |
| Week 2 | Design & MVP Build | Frontend screens, Backend API |
| Week 3 | Testing & Demo | Integration testing, Demo video |

---

## Demo Walkthrough

1. **Landing Screen** - User sees app intro with "Get Started" button
2. **Profile Setup** - User selects:
   - User type (salary earner/freelancer/business owner)
   - Income range
   - State of residence
3. **Tax Results** - User sees applicable taxes explained simply
4. **Compliance Checklist** - User follows step-by-step actions
5. **Completion** - User marks tasks complete, gets success confirmation

---

## Team

| Role | Responsibility |
|------|----------------|
| Frontend Developer | React Native mobile app |
| Backend Developer | Django REST API |
| Designer | UI/UX design (Figma) |

---

## Repository Structure

```
TaxClarity/
├── frontend/          # React Native Expo app
│   ├── app/           # Screens (expo-router)
│   ├── components/    # Reusable UI components
│   ├── services/      # API client
│   ├── store/         # Zustand state
│   └── constants/     # Theme, colors
│
└── backend/           # Django API
    └── taxclarity/
        ├── App/       # Main application
        │   ├── models.py
        │   ├── views.py
        │   ├── serializers.py
        │   └── urls.py
        └── taxclarity/
            ├── settings.py
            └── urls.py
```

---

*Last Updated: January 18, 2026*

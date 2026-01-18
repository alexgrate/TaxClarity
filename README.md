# TaxClarity NG 🇳🇬

A mobile app that helps Nigerians understand and comply with the 2026 tax reforms.

![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-blue)
![Django](https://img.shields.io/badge/Backend-Django_REST_Framework-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📱 About

TaxClarity NG is a personalized tax clarity assistant that:
- Explains applicable tax rules in **plain language**
- Provides **step-by-step compliance guidance**
- Helps users avoid penalties and stay tax compliant

### Target Users
- 💼 Salary Earners
- 💻 Freelancers & Gig Workers
- 🏪 Small Business Owners

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile App** | React Native + Expo SDK 54 |
| **Navigation** | Expo Router (file-based) |
| **State** | Zustand + AsyncStorage |
| **Forms** | React Hook Form |
| **Backend** | Django + Django REST Framework |
| **Database** | PostgreSQL (prod) / SQLite (dev) |

---

## 📂 Project Structure

```
TaxClarity/
├── frontend/              # React Native Expo app (frontend branch)
│   ├── app/               # Screens (expo-router)
│   │   ├── index.tsx      # Landing screen
│   │   ├── profile-setup.tsx
│   │   └── next-steps.tsx
│   ├── components/ui/     # Reusable UI components
│   ├── services/          # API client (Axios)
│   ├── store/             # Zustand state management
│   ├── constants/         # Theme colors
│   └── docs/              # Documentation
│
└── backend/               # Django API (main branch)
    └── taxclarity/
        ├── App/           # Main application
        └── taxclarity/    # Project settings
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Expo Go app on your phone

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/alexgrate/TaxClarity.git
cd TaxClarity

# Switch to frontend branch
git checkout frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

### Backend Setup

```bash
# Switch to main branch (from repo root)
git checkout main
cd backend/taxclarity

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-cors-headers

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start server
python manage.py runserver 0.0.0.0:8000
```

---

## 🔗 Connecting Frontend to Backend

1. **Find your computer's IP address:**
   ```powershell
   ipconfig
   # Look for: IPv4 Address . . . : 192.168.x.x
   ```

2. **Update `services/config.ts`:**
   ```typescript
   const LOCAL_NETWORK_URL = 'http://192.168.x.x:8000';
   ```

3. Both phone and computer must be on the **same WiFi network**.

---

## 🎯 MVP Features

- [x] User Tax Profile Setup
- [x] Tax Applicability Checker
- [x] Simplified Tax Explanation
- [x] Step-by-Step Compliance Checklist
- [ ] Basic Reminders & Alerts

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [docs/PRD.md](docs/PRD.md) | Product Requirements Document |
| [docs/BACKEND_SPECS.md](docs/BACKEND_SPECS.md) | Backend Implementation Guide |

---

## 📸 Screens

| # | Screen | Description |
|---|--------|-------------|
| 1 | **Landing** | Hero image with "Get Started" button |
| 2 | **Profile Setup** | Select user type, income range, state |
| 3 | **Next Steps** | Compliance checklist with checkboxes |
| 4 | **Success Modal** | Confirmation when all tasks complete |

---

## 🎨 Design

**Color Palette**
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#3B4CCA` | Buttons, links, accents |
| White | `#FFFFFF` | Backgrounds |
| Text Primary | `#111827` | Headings |
| Text Secondary | `#6B7280` | Body text |
| Border | `#E5E7EB` | Input borders |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Frontend Developer** - React Native mobile app
- **Backend Developer** - Django REST API

---

*Built for Nigerians, by Nigerians* 🇳🇬

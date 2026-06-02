# Medicare 🩺
### AI-Driven Patient Vitals Monitoring & Clinical Decision Support

Medicare is a premium, state-of-the-art clinical dashboard and patient care platform built to streamline communication between patients, doctors, and nurses. Designed with a content-first, high-contrast minimal monochrome interface, Medicare delivers critical clinical utilities and AI-assisted workflows directly to the care team and the patient.

---

## 🚀 Hackathon-Winning Key Features

### 1. AI Vitals Check-up Triage Engine (CometAPI)
Automates patient prioritization by classifying vitals upon log entry. The system flags clinical concerns immediately and returns structured priority levels (High, Medium, Normal) alongside key risk-factors to alert staff to anomalies.

### 2. Impending Health Dip Correlation Predictor (Rule-Based Trend AI)
Analyzes cross-metric relationships over time (specifically tracking declining sleep hours coupled with increasing pain scores over a 2–3 day window). The model flags wellness drops ahead of time, showing alert banners on both the clinic detail page and the patient's dashboard.

### 3. Patient Clinical Note Summarization (CometAPI)
Allows doctors and nurses to summarize raw check-up notes, symptom descriptions, and diagnostic assessments into structured clinical reports containing medical histories, direct symptoms, and immediate action items.

### 4. Smart Sleep-Adaptive Medication Scheduler
Dynamically adjusts medication timelines based on actual patient rest patterns instead of rigid clocks. The scheduler delays morning medications if a patient sleeps late, advances evening doses to support rest, and prioritizes pain medication schedules when active pain scores spike.

### 5. Context-Aware AI Chatbot (CometAPI)
A floating interactive assistant with real-time access to the user's patient logs and medication profiles. The AI acts as a dedicated health coach, analyzing daily logs, warning users of health dips, explaining medication schedule adjustments, and providing empathetic, clinical guidance.

---

## 🎨 Design Philosophy
* **Minimalist Monochrome Aesthetics**: Stripped of generic colors to enforce a distraction-free, clinical focus. Employs curated gradients, stark white card layouts, black headers, deep borders, and subtle shadows.
* **Typographic Excellence**: Implements clean, modern typography (Outfit / Inter) with variable font weights for superior hierarchy.
* **Micro-Animations & Smooth Transitions**: Features hover expansions, active state transitions, and loading states for a premium, responsive feel.

---

## 📂 Project Organization

Following standard Clean Architecture conventions, our React components and pages have been reorganized into modular domains:

```
src/
├── components/          # Reusable shared UI widgets (AIChatBot, ConfirmModal, Layout)
├── context/             # Global React Context providers (AuthContext)
├── lib/                 # Third-party wrappers and utility functions (ai, supabase)
└── pages/               # Route views mapped in App.tsx
    ├── Auth/            # Login and verification views (Login, AuthContent)
    ├── Dashboards/      # Specialized dashboard panels (Admin, Doctor, Nurse, Patient)
    ├── Patient/         # Patient details, logging views, and directories
    └── Staff/           # Staff onboarding screens and directories
```

---

## ⚙️ Tech Stack & Dependencies

* **Frontend**: React 19 + TypeScript + Vite
* **Database & Auth**: Supabase DB with Row-Level Security (RLS)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Charts**: Recharts
* **AI Completion**: CometAPI Chat Completions SDK

---

## 🛠️ Local Setup & Run

### 1. Environment Configuration
Create a `.env.local` file in the root directory and populate it with your Supabase and CometAPI credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_COMET_API_KEY=your-comet-api-key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Compile Production Build
```bash
npm run build
```

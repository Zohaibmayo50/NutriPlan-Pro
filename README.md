# NutriPlan Pro

A modern SaaS application for nutrition planning and diet management.

## Phase 1 - Foundation ✅
## Phase 2 - Authentication ✅

Complete project with Firebase authentication, user management, and access control.

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Authentication & Database
- **Firebase Authentication** - User authentication (Google, Apple, Email/Password)
- **Cloud Firestore** - NoSQL database for user profiles and data

## Project Structure

```
Diet/
├── src/                      # Frontend source code
│   ├── assets/              # Static assets (images, icons)
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── onboarding/     # Onboarding wizard
│   │   └── plans/          # Plan management pages
│   ├── routes/             # Routing configuration
│   ├── context/            # React Context providers
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── server/                 # Backend source code
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   └── index.js          # Server entry point
├── public/                # Public assets
├── index.html            # HTML template
├── package.json          # Frontend dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

3. **Configure Firebase:**
   - Follow the complete setup guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
   - Copy `.env.example` to `.env` and add your Firebase credentials

### Running the Application

#### Option 1: Run Both (Frontend + Backend)
```bash
npm run dev:all
```

#### Option 2: Run Separately

**Frontend (Port 3000):**
```bash
npm run dev
```

**Backend (Port 5000):**
```bash
npm run server
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Features (Phase 1 + 2)

### ✅ Phase 1 - Foundation
- Clean, scalable project structure
- React + Vite setup with Tailwind CSS
- React Router with protected routes
- Responsive layouts (Auth & App)
- Placeholder pages (Login, Onboarding, Dashboard, New Plan)
- Express backend with health check

### ✅ Phase 2 - Authentication
- **Firebase Authentication** integration
- **Sign-in methods:**
  - Google Sign-In (1-click)
  - Apple Sign-In (1-click)
  - Email/Password (auto-creates account)
- **User Profile Management:**
  - Automatic Firestore profile creation on first login
  - Detects first-time vs returning users
  - Stores user metadata (email, name, photo, provider)
- **Access Control:**
  - Protected routes with authentication checks
  - Onboarding flow for first-time users
  - Automatic redirect based on onboarding status
- **Security:**
  - Firestore security rules (users can only access own data)
  - Token-based authentication
  - Secure user profile access

### 🔜 Coming in Phase 3
- PDF parsing functionality
- Meal plan generation
- Client management
- Advanced features

## Development Notes

### Phase 2 Objectives
Phase 2 implements **real authentication and user management**:
- Firebase Authentication replaces mock auth
- User profiles automatically created in Firestore
- First-time users detected and routed to onboarding
- Returning users skip onboarding and go to dashboard
- All authentication state persisted and secure

### Authentication Flow
1. User visits app → redirected to login
2. User signs in (Google/Apple/Email)
3. System checks if user exists in Firestore:
   - **New user**: Create profile → redirect to onboarding
   - **Returning user without onboarding**: redirect to onboarding
   - **Returning user with onboarding**: redirect to dashboard
4. Protected routes enforce authentication and onboarding status

### Code Quality
- Functional React components with hooks
- Modern ES6+ syntax
- Meaningful comments throughout
- No hard-coded business logic
- Extensible architecture for future phases

## Scripts

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run start` - Start server
- `npm run dev` - Start server with watch mode

## Environment Variables

### Frontend (.env in project root)
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (server/.env)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Important:** See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for complete Firebase configuration instructions.

## License

Private - All rights reserved

## Support

For questions or issues, contact the development team.

---

**Phase 2 Status:** ✅ Complete - Real authentication implemented, ready for Phase 3

## Firebase Setup

Before running the app, you must configure Firebase. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

**Quick Start:**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Google, Apple, Email/Password)
3. Create Firestore database
4. Copy credentials to `.env` file
5. Deploy security rules from `firestore.rules`

## Key Features Implemented

### Authentication
- ✅ Google Sign-In
- ✅ Apple Sign-In  
- ✅ Email/Password authentication
- ✅ Automatic account creation
- ✅ Persistent auth state

### User Management
- ✅ Firestore user profiles
- ✅ First-time user detection
- ✅ Onboarding flow control
- ✅ Profile photo support

### Security
- ✅ Protected routes
- ✅ Firestore security rules
- ✅ Token-based auth
- ✅ User data isolation

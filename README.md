# Task Manager Dashboard

A full-stack task management application built with Next.js 14, React 18, TypeScript, Tailwind CSS, Material UI, Redux Toolkit, and Firebase.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Material UI (MUI)
- **State Management**: Redux Toolkit
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Ready for Vercel/Netlify

## Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- Firebase project with Firestore and Authentication enabled

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-manager-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Get your Firebase configuration

### 4. Environment Variables

Copy the `env.example` file to `.env.local` and fill in your Firebase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

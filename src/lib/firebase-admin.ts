import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
  const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  };

  // Initialize Firebase Admin
  app = getApps().length === 0 
    ? initializeApp({
        credential: cert(firebaseAdminConfig),
        databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`,
      })
    : getApps()[0];

  // Initialize Firebase Admin services
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
}

export { adminAuth, adminDb };
export default app;

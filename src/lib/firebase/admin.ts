import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const DEFAULT_DATABASE_ID = "(default)";

function privateKey(): string | undefined {
  const value = process.env.FIREBASE_PRIVATE_KEY;
  if (!value) return undefined;
  return value.replace(/\\n/g, "\n");
}

/** True when this server can sign in to the Firebase project. */
export function isFirebaseConfigured(): boolean {
  if (!process.env.FIREBASE_PROJECT_ID) return false;
  const key = privateKey();
  if (process.env.FIREBASE_CLIENT_EMAIL && key) return true;
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

function createApp(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const key = privateKey();

  if (projectId && clientEmail && key) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: key }),
      projectId,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

export function getFirebaseApp(): App {
  return getApps()[0] ?? createApp();
}

/**
 * Firestore for the clinic record.
 * Create the database as Enterprise edition, Native mode, in the Firebase console.
 */
export function getDb(): Firestore {
  const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim() || DEFAULT_DATABASE_ID;
  return getFirestore(getFirebaseApp(), databaseId);
}

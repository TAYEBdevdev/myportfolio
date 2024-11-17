const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Ensure all necessary environment variables are set
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('Missing Firebase credentials in .env file');
  process.exit(1); // Exit the application if Firebase credentials are missing
}

// Firebase Admin SDK initialization
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') // Convert escaped \\n to actual newlines
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com` // Bucket URL format
  });

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit if Firebase initialization fails
}

const bucket = admin.storage().bucket();
module.exports = bucket;

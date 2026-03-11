let admin;
try {
    admin = require('firebase-admin');
} catch (error) {
    admin = null;
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

const canUseServiceAccount =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    privateKey;

if (admin && !admin.apps.length && canUseServiceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

const isFirebaseConfigured = () => Boolean(admin && admin.apps.length);

const getStorageBucket = () => {
    if (!isFirebaseConfigured()) {
        return null;
    }

    return admin.storage().bucket();
};

module.exports = {
    isFirebaseConfigured,
    getStorageBucket
};

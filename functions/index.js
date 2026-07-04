const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

// Cette fonction se déclenche à chaque fois qu'un utilisateur est créé dans Auth
exports.createUserDocument = functions.auth.user().onCreate((user) => {
    const db = admin.firestore();
    
    // On crée automatiquement le document dans la collection 'users'
    return db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        emailLower: user.email ? user.email.toLowerCase() : null, // Important pour la recherche insensible à la casse
        displayName: user.displayName || 'Utilisateur',
        photoURL: user.photoURL || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSeen: admin.firestore.FieldValue.serverTimestamp()
    });
});

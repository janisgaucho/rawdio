const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function syncAllUsers() {
  console.log("Démarrage de la synchronisation...");
  
  // Récupère tous les utilisateurs (par lots de 1000)
  const listUsersResult = await auth.listUsers(1000);
  
  let count = 0;
  for (const user of listUsersResult.users) {
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        uid: user.uid,
        email: user.email,
        emailLower: user.email ? user.email.toLowerCase() : null,
        displayName: user.displayName || 'Utilisateur',
        photoURL: user.photoURL || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`[OK] Utilisateur importé : ${user.email}`);
      count++;
    } else {
      // On met à jour l'emailLower si manquant
      if (!doc.data().emailLower && user.email) {
          await userRef.update({
              emailLower: user.email.toLowerCase()
          });
          console.log(`[UPDATE] Utilisateur mis à jour : ${user.email}`);
          count++;
      } else {
          console.log(`[SKIP] Déjà existant : ${user.email}`);
      }
    }
  }
  
  console.log(`Terminé ! ${count} utilisateurs traités.`);
}

syncAllUsers().catch(console.error);
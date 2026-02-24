/\*\*

- 📚 MONGODB INDEXES POUR TRANSACTIONS
-
- Ce fichier contient les indexes recommandés pour optimiser les performances
- des requêtes sur les collections CommandeProduct et Client
  \*/

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTION: CommandeProduct
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- Index 1: orderNumber (Recherche rapide par orderNumber)
- Usage: Recherche/mise à jour par orderNumber
- Type: UNIQUE (chaque orderNumber est unique)
  \*/
  db.CommandeProducts.createIndex(
  { orderNumber: 1 },
  { unique: true, sparse: true }
  );

/\*\*

- Index 2: clientId + createdAt (Récupérer les commandes d'un client)
- Usage: Lister las commandes d'un client trié par date
- Performance: Critique pour les requêtes GET
  \*/
  db.CommandeProducts.createIndex(
  { clientId: 1, createdAt: -1 },
  { name: "clientId_createdAt" }
  );

/\*\*

- Index 3: clientId + status (Filtrer par statut rapidement)
- Usage: Compter les commandes pending/completed/failed
  \*/
  db.CommandeProducts.createIndex(
  { clientId: 1, status: 1 },
  { name: "clientId_status" }
  );

/\*\*

- Index 4: clientId + category (Filtrer par catégorie)
- Usage: Lister les ventes par catégorie
  \*/
  db.CommandeProducts.createIndex(
  { clientId: 1, category: 1 },
  { name: "clientId_category" }
  );

/\*\*

- Index 5: reference (Recherche rapide par référence client)
- Usage: Vérifier si une référence existe déjà
  \*/
  db.CommandeProducts.createIndex(
  { reference: 1 },
  { name: "reference" }
  );

/\*\*

- Index 6: clientId + student (Recherche par étudiant)
- Usage: Chercher les commandes d'un étudiant
  \*/
  db.CommandeProducts.createIndex(
  { clientId: 1, student: 1 },
  { name: "clientId_student" }
  );

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTION: Client (Utilisateurs avec role="client")
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- Index 1: apiKey (Authentification rapide)
- Usage: Valider les credentials API
- Type: UNIQUE (un apiKey = un client)
  \*/
  db.Admins.createIndex(
  { apiKey: 1 },
  { unique: true, sparse: true }
  );

/\*\*

- Index 2: email (Recherche/login par email)
- Usage: Authentification, vérification unicité
- Type: UNIQUE (un email = un client)
  \*/
  db.Admins.createIndex(
  { email: 1 },
  { unique: true, sparse: true }
  );

/\*\*

- Index 3: uuid (Recherche par UUID)
- Usage: Identifier le client sans révéler l'ObjectId
- Type: UNIQUE
  \*/
  db.Admins.createIndex(
  { uuid: 1 },
  { unique: true, sparse: true }
  );

/\*\*

- Index 4: isActive (Filtrer les clients actifs)
- Usage: Vérifier rapidement si un client est actif
  \*/
  db.Admins.createIndex(
  { isActive: 1 },
  { name: "isActive_index" }
  );

// ─────────────────────────────────────────────────────────────────────────────
// SCRIPTS DE MIGRATION / MISE EN PLACE
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- Exécutez ce script dans MongoDB Shell ou via votre outil de gestion MongoDB
-
- Pour MongoDB Atlas (Cloud):
- 1.  Allez dans le cluster
- 2.  Cliquez sur "Collections"
- 3.  Sélectionnez la base de données et collection
- 4.  Allez dans l'onglet "Indexes"
- 5.  Ou utilisez un outil comme MongoDB Compass
-
- Pour MongoDB local:
- 1.  Connectez-vous: mongosh
- 2.  Utilisez la base: use your_database_name
- 3.  Exécutez les commandes createIndex ci-dessus
-
- Pour Node.js:
- Voir l'exemple dans: createIndexes.js
  \*/

// ─────────────────────────────────────────────────────────────────────────────
// NODE.JS - SCRIPT DE CRÉATION DES INDEXES
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- File: src/lib/createIndexes.ts
- Utilisez ce script pour initialiser les indexes lors du démarrage
  \*/

/\*

import mongoose from 'mongoose';
import { CommandeProduct, Client } from '@/utils/models';

export async function createIndexes() {
try {
console.log('🔍 Création des indexes MongoDB...');

    // CommandeProduct Indexes
    await CommandeProduct.collection.createIndex({ orderNumber: 1 }, { unique: true, sparse: true });
    console.log('✅ Index orderNumber created');

    await CommandeProduct.collection.createIndex({ clientId: 1, createdAt: -1 });
    console.log('✅ Index clientId_createdAt created');

    await CommandeProduct.collection.createIndex({ clientId: 1, status: 1 });
    console.log('✅ Index clientId_status created');

    await CommandeProduct.collection.createIndex({ clientId: 1, category: 1 });
    console.log('✅ Index clientId_category created');

    await CommandeProduct.collection.createIndex({ reference: 1 });
    console.log('✅ Index reference created');

    await CommandeProduct.collection.createIndex({ clientId: 1, student: 1 });
    console.log('✅ Index clientId_student created');

    // Client Indexes
    await Client.collection.createIndex({ apiKey: 1 }, { unique: true, sparse: true });
    console.log('✅ Index apiKey created');

    await Client.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Index email created');

    await Client.collection.createIndex({ uuid: 1 }, { unique: true, sparse: true });
    console.log('✅ Index uuid created');

    await Client.collection.createIndex({ isActive: 1 });
    console.log('✅ Index isActive created');

    console.log('✅ Tous les indexes ont été créés avec succès!');

} catch (error) {
console.error('❌ Erreur lors de la création des indexes:', error);
}
}

// Appelez cette fonction au démarrage de votre app
// Dans src/lib/db.ts ou src/app/layout.tsx:
// await createIndexes();

\*/

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE & EXPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- WHY THESE INDEXES?
-
- 1.  orderNumber UNIQUE
- - Garantit l'unicité
- - Accélère les recherches par orderNumber
- - Utilisé dans: PUT /api/transactions (mise à jour)
-
- 2.  clientId + createdAt
- - Les requêtes "afficher les commandes du client" sont très fréquentes
- - Tri par date est quasi systématique (front-end)
- - Index composite idéal pour cette requête
- - SANS: Full collection scan (TRÈS LENT avec des millions de records)
- - AVEC: Index seek + sort (quasi instantané)
-
- 3.  clientId + status
- - Calcul des statistiques par statut (API retourne ces stats)
- - Requête: { clientId: X, status: "pending" }.count()
- - TRÈS utilisé dans le dashboard
-
- 4.  clientId + category
- - Filtrage par catégorie côté API GET et frontend
- - Statistiques par catégorie
-
- 5.  reference
- - Vérification d'unicité des références côté client
- - Deduplication des transactions
-
- 6.  clientId + student
- - Recherche dans le tableau (frontend filtre)
- - Historique d'un étudiant spécifique
-
- 7-10. Client Indexes
- - Authentification par apiKey (critique, rapide!)
- - Recherche par email (login, registration)
- - UUID pour identification externe
- - isActive pour vérifier les clients actifs
    \*/

// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE DES INDEXES
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- POUR LISTER LES INDEXES D'UNE COLLECTION:
- db.CommandeProducts.getIndexes()
-
- POUR SUPPRIMER UN INDEX:
- db.CommandeProducts.dropIndex("orderNumber_1")
-
- POUR SUPPRIMER TOUS LES INDEXES (sauf \_id):
- db.CommandeProducts.dropIndexes()
-
- POUR ANALYSER LES PERFORMANCES D'UNE REQUÊTE:
- db.CommandeProducts.find({ clientId: ObjectId("..."), status: "pending" }).explain("executionStats")
-
- POUR RECONSTRUIRE LES INDEXES (si corruption):
- db.CommandeProducts.reIndex()
  \*/

// ─────────────────────────────────────────────────────────────────────────────
// MONITORING DES INDEXES
// ─────────────────────────────────────────────────────────────────────────────

/\*\*

- MongoDB Atlas - Monitoring:
- 1.  Allez dans "Performance Advisor"
- 2.  Vérifiez les "Slow Queries"
- 3.  Suivez les recommandations d'indexes
-
- MongoDB Compass - Analyse:
- 1.  Connect Compass à votre MongoDB
- 2.  Sélectionnez collection → Indexes tab
- 3.  Voyez les indexes, taille, utilisation
-
- Metrics à surveiller:
- - Index Size (ne doit pas croître trop vite)
- - Accesses (nombre de fois utilisé)
- - Efficiency (ratio documents examinés vs retournés)
    \*/

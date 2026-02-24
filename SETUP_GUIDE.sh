#!/bin/bash

# 🚀 SETUP GUIDE - TRANSACTIONS IMPLEMENTATION
# ──────────────────────────────────────────────────────────────────────────────

# Ce script guide les étapes de mise en place de la fonctionnalité Transactions

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                    GUIDE DE MISE EN PLACE - TRANSACTIONS                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

ÉTAPE 1: VÉRIFIER LES FICHIERS CRÉÉS
────────────────────────────────────────────────────────────────────────────

API Routes:
  ✓ src/app/api/transactions/route.ts          (POST, PUT, GET - Externes)
  ✓ src/app/api/transactions/client/route.ts   (GET - Interne)

UI Dashboard:
  ✓ src/app/(backoffice)/(portal)/transactions/page.tsx

Documentation:
  ✓ API_TRANSACTIONS_README.md
  ✓ API_TRANSACTIONS_EXAMPLE.md
  ✓ API_TRANSACTIONS_TEST.sh
  ✓ Transactions_API.thunderclient.json
  ✓ MONGODB_INDEXES.md
  ✓ IMPLEMENTATION_SUMMARY.txt


ÉTAPE 2: CRÉER LES INDEXES MONGODB
────────────────────────────────────────────────────────────────────────────

Pour de meilleures performances, créez ces indexes:

Via MongoDB Atlas (Cloud):
  1. Allez à votre cluster
  2. Collections → Sélectionnez votre DB
  3. IndexES tab → Create Index
  4. Créez chaque index de MONGODB_INDEXES.md

Via MongoDB Compass (Local):
  1. Connectez-vous à votre MongoDB local
  2. Sélectionnez la collection
  3. Indexes tab → Create Index
  4. Suivez MONGODB_INDEXES.md

Via Script (Node.js):
  >>> Créez src/lib/createIndexes.ts (voir MONGODB_INDEXES.md)
  >>> Appelez createIndexes() au démarrage


ÉTAPE 3: TESTER LES ENDPOINTS
──────────────────────────────────────────────────────────────────────────

Méthode 1: Script cURL
  $ bash API_TRANSACTIONS_TEST.sh
  
  Assurez-vous d'avoir remplacé:
  - BASE_URL (http://localhost:3000 ou votre URL)
  - API_KEY (trouvez-la dans le dashboard client)
  - API_SECRET (trouvez-le dans le dashboard client)

Méthode 2: Thunder Client
  1. Ouvrez VS Code
  2. Installez l'extension "Thunder Client"
  3. Cliquez sur Thunder Client dans la barre latérale
  4. Cliquez sur "Import" → Sélectionnez Transactions_API.thunderclient.json
  5. Remplacez {{apiKey}} et {{apiSecret}} en haut à gauche
  6. Exécutez les requêtes dans l'ordre

Méthode 3: Postman
  1. Importez Transactions_API.thunderclient.json
  2. Créez les environments avec apiKey et apiSecret
  3. Exécutez les requêtes


ÉTAPE 4: VÉRIFIER LA PAGE /TRANSACTIONS
──────────────────────────────────────────────────────────────────────────

  1. Démarrez votre app: npm run dev
  2. Logez-vous avec un compte client
  3. Allez à /dashboard → /transactions
  4. Vous devriez voir:
     ✓ Stats Cards en haut
     ✓ Barre de recherche et filtres
     ✓ DataTable vide (ou avec données si vous en avez créées)

  Si la page est vide:
  • Créez des commandes via l'API (Script cURL ou Thunder Client)
  • Rafraîchissez la page
  • Les commandes devraient apparaître


ÉTAPE 5: TESTER LA CHAÎNE COMPLÈTE
──────────────────────────────────────────────────────────────────────────

Test Workflow Complet:
  
  1. Créer 3 commandes via API
     $ curl POST /api/transactions \
       -H "x-api-key: YOUR_KEY" \
       -H "x-api-secret: YOUR_SECRET" \
       -d "{ category: Livres, student: Jean, ... }"
       
     Réponse: { orderNumber: "ORD-..." }
  
  2. Voir les commandes dans le dashboard
     Aller à /transactions → Verify les commandes s'affichent
  
  3. Filtrer/Chercher
     - Écrivez dans la barre de recherche
     - Sélectionnez une catégorie
     - Triez par date/montant
     - Les résultats DOIVENT filtrer en temps réel
  
  4. Récupérer via API avec filtres
     $ curl GET "/api/transactions?status=pending" \
       -H "x-api-key: YOUR_KEY" \
       -H "x-api-secret: YOUR_SECRET"
  
  5. Mettre à jour un statut
     $ curl PUT /api/transactions \
       -H "x-api-key: YOUR_KEY" \
       -H "x-api-secret: YOUR_SECRET" \
       -d "{ orderNumber: 'ORD-...', status: 'completed' }"
  
  6. Rafraîchir le dashboard
     Les changements doivent être visibles immédiatement


ÉTAPE 6: VÉRIFIER LA SÉCURITÉ
───────────────────────────────────────────────────────────────────────────

✓ Tester sans credentials:
  $ curl GET http://localhost:3000/api/transactions
  Response: 401 - Missing API credentials

✓ Tester avec credentials invalides:
  $ curl GET http://localhost:3000/api/transactions \
    -H "x-api-key: invalid" \
    -H "x-api-secret: invalid"
  Response: 403 - Invalid API key

✓ Vérifier l'isolation des données:
  - Créez des CommandeProducts avec différents clients
  - Chaque client ne devrait voir QUE ses commandes
  - Tester avec différentes apiKeys


ÉTAPE 7: VÉRIFIER LES STATISTIQUES
──────────────────────────────────────────────────────────────────────────

  GET /api/transactions/client retourne:
  {
    success: true,
    data: [ Commandes... ],
    stats: {
      totalCommandes: 42,
      totalRevenu: 2150.75,
      categories: [
        { name: "Livres", count: 15, revenue: 675.50 },
        ...
      ],
      byStatus: {
        pending: 5,
        completed: 35,
        failed: 2
      }
    }
  }
  
  Vérifier que:
  ✓ totalCommandes = count(commandes)
  ✓ totalRevenu = sum(amount)
  ✓ categories correctes
  ✓ byStatus sums corrects


ÉTAPE 8: INTÉGRER DANS VOTRE PLATEFORME CLIENT
──────────────────────────────────────────────────────────────────────────

Pour les développeurs de la plateforme cliente:

```javascript
// .env
SAASCANDY_API_KEY=your_key
SAASCANDY_API_SECRET=your_secret
SAASCANDY_API_URL=https://yourapp.com/api

// Créer une vente
async function createSale() {
  const response = await fetch(
    `${process.env.SAASCANDY_API_URL}/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SAASCANDY_API_KEY,
        "x-api-secret": process.env.SAASCANDY_API_SECRET",
      },
      body: JSON.stringify({
        category: "Livres",
        student: "Jean Dupont",
        classe: "6A",
        amount: 45.50,
        phone: "+243123456789",
        reference: transaction.id,
        description: "Vente effectuée",
      }),
    }
  );
  
  const { data } = await response.json();
  console.log("SaasCandy Order:", data.orderNumber);
}

// Mettre à jour après paiement
async function updateSaleStatus(orderNumber) {
  await fetch(
    `${process.env.SAASCANDY_API_URL}/transactions`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SAASCANDY_API_KEY,
        "x-api-secret": process.env.SAASCANDY_API_SECRET",
      },
      body: JSON.stringify({
        orderNumber: orderNumber,
        status: "completed",
        reference: payment.txnId,
      }),
    }
  );
}
```


ÉTAPE 9: MONITORING & MAINTENANCE
───────────────────────────────────────────────────────────────────────────

Daily Checks:
  □ Les commandes sont créées correctement
  □ Les statistiques sont à jour
  □ Pas d'erreurs 500 dans les logs
  □ Performance acceptable (< 500ms réponse)

Monthly Checks:
  □ Vérifier les indexes MongoDB
  □ Analyser les requêtes lentes (MongoDB Atlas Profiler)
  □ Archiver les anciennes commandes si nécessaire
  □ Vérifier les quotas API

Documentation:
  □ Mettre à jour la documentation des clients
  □ Envoyer les credentialsAPI avant launch
  □ Expliquer le format de response


ÉTAPE 10: LANCER EN PRODUCTION
───────────────────────────────────────────────────────────────────────────

Checklist Pre-Launch:
  ✓ Tous les tests passent
  ✓ Indexes créés sur production
  ✓ Variables d'environnement configurées
  ✓ HTTPS activé
  ✓ Rate limiting peut être ajouté
  ✓ Monitoring/logs configurés
  ✓ Backup MongoDB en place
  ✓ Documentation envoyée aux clients

Deploy:
  1. git add . && git commit -m "Add transactions feature"
  2. git push origin main
  3. Deploy sur votre hosting (Vercel, Railway, etc.)
  4. Vérifier les logs: pas d'erreur
  5. Tester un endpoint en production: curl ...


RÉSOLUTION DE PROBLÈMES
────────────────────────────────────────────────────────────────────────

❌ Page /transactions affiche "Chargement..." éternellement
  → Vérifier que /api/transactions/client répond (check network tab)
  → Vérifier que l'utilisateur est bien authentifié
  → Vérifier les logs serveur pour erreurs

❌ Création de commande retourne 500
  → Vérifier que MongoDB est accessible
  → Vérifier les logs: "❌ Erreur POST /api/transactions:"
  → Vérifier que les champs requis sont présents

❌ Credentials invalides (403)
  → Vérifier que apiKey existe dans la DB (client trouvé)
  → Vérifier que apiSecret correspond (pas de typo)
  → Vérifier que le client est actif (isActive: true)

❌ orderNumber en doublon
  → Impossible avec le format ORD-{timestamp}-{random}
  → Si ça arrive: database corruption, restaurer backup

❌ Performance lente
  → Vérifier les indexes MongoDB
  → Lancer explain() sur les requêtes lentes
  → Ajouter du caching Redis si nécessaire


FICHIERS DE RÉFÉRENCE
────────────────────────────────────────────────────────────────────────────

📖 LISEZ CES FICHIERS:
  1. API_TRANSACTIONS_README.md          → Architecture & vue d'ensemble
  2. API_TRANSACTIONS_EXAMPLE.md         → Exemples code détaillés
  3. MONGODB_INDEXES.md                  → Optimisations DB
  4. IMPLEMENTATION_SUMMARY.txt          → Résumé complet

🧪 TESTEZ AVEC:
  1. API_TRANSACTIONS_TEST.sh            → cURL tests
  2. Transactions_API.thunderclient.json → GUI tests


QUESTIONS?
──────────────────────────────────────────────────────────────────────────

1. Où trouver apiKey et apiSecret?
   → Dans le dashboard client, section "API Credentials"

2. Comment les clients créent-ils des commandes?
   → Ils intègrent l'API dans leur plateforme (voir STEP 8)

3. Peut-on modifier une commande depuis le dashboard?
   → Non, c'est read-only. Modifications via API seulement.

4. Les commandes sont-elles sécurisées?
   → Oui: apiKey/secret, isolation client, validation stricte

5. Comment intégrer avec mon système de paiement?
   → Créer → (Client paie) → Mettre à jour status à "completed"


STATUS: ✅ READY TO LAUNCH
────────────────────────────────────────────────────────────────────────────

Tous les fichiers sont en place. Suivez les étapes ci-dessus.
Vous êtes prêt à lancer en production! 🚀

═══════════════════════════════════════════════════════════════════════════════

EOF

echo ""
echo "✅ Lisez ce guide pour mettre en place la fonctionnalité Transactions!"
echo ""

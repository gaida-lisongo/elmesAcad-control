#!/bin/bash

# 🧪 TRANSACTIONS API TEST EXAMPLES
# Ce script contient des exemples cURL pour tester l'API des transactions
# 
# ⚠️ IMPORTANT: Remplacez les valeurs suivantes:
# - BASE_URL: L'URL de votre application (ex: http://localhost:3000)
# - API_KEY: Votre clé API (trouvez-la dans le dashboard client)
# - API_SECRET: Votre secret API (trouvez-le dans le dashboard client)


BASE_URL="http://localhost:3000"
API_KEY="a3c168840820ce29f2818994a2ae49e2929f5c73fa56bc2aa818df0b560e6be6"
API_SECRET="0b1d4d7e5fe3224098cf1fd23192aa0c05a9dbf0ea42b504559d41c5d059f4f2"


# ───────────────────────────────────────────────────────────────────────────────
# 1️⃣ CRÉER UNE NOUVELLE COMMANDE (POST)
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 1. Créer une nouvelle commande ===" 
curl -X POST "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET" \
  -d '{
    "category": "Livres",
    "student": "Jean Dupont",
    "classe": "6A",
    "amount": 45.50,
    "phone": "+243123456789",
    "reference": "REF-12345",
    "description": "Manuel de français - 6A"
  }'

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 2️⃣ CRÉER UNE AUTRE COMMANDE (avec une autre catégorie)
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 2. Créer une autre commande (Uniformes) ===" 
curl -X POST "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET" \
  -d '{
    "category": "Uniformes",
    "student": "Marie Dupont",
    "classe": "5B",
    "amount": 65.00,
    "phone": "+243987654321",
    "reference": "REF-12346",
    "description": "Uniforme complet - 5B"
  }'

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 3️⃣ CRÉER UNE TROISIÈME COMMANDE (pour avoir plus de données)
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 3. Créer une troisième commande (Fournitures) ===" 
curl -X POST "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET" \
  -d '{
    "category": "Fournitures",
    "student": "Pierre Martin",
    "classe": "4A",
    "amount": 25.50,
    "phone": "+243555555555",
    "reference": "REF-12347",
    "description": "Cahiers, stylos et crayons"
  }'

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 4️⃣ RÉCUPÉRER TOUTES LES COMMANDES (GET)
# Extractez l'orderNumber de la première création pour utiliser dans les tests suivants
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 4. Récupérer toutes les commandes ===" 
curl -X GET "$BASE_URL/api/transactions" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET"

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 5️⃣ RÉCUPÉRER LES COMMANDES FILTRÉES PAR STATUT
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 5. Récupérer les commandes en attente (status=pending) ===" 
curl -X GET "$BASE_URL/api/transactions?status=pending" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET"

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 6️⃣ RÉCUPÉRER LES COMMANDES FILTRÉES PAR CATÉGORIE
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 6. Récupérer les commandes de la catégorie 'Livres' ===" 
curl -X GET "$BASE_URL/api/transactions?category=Livres" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET"

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 7️⃣ METTRE À JOUR UNE COMMANDE (PUT)
# ⚠️ Remplacez ORD-1708876543210-ABC123 par un orderNumber réel de vos tests
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 7. Mettre à jour le statut d'une commande de 'pending' à 'completed' ===" 
# IMPORTANT: Récupérez l'orderNumber de la première création et remplacez ci-dessous
curl -X PUT "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET" \
  -d '{
    "orderNumber": "ORD-1708876543210-ABC123",
    "status": "completed",
    "reference": "PAID-TXN-67890"
  }'

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 8️⃣ METTRE À JOUR UNE COMMANDE EN ÉCHEC
# ───────────────────────────────────────────────────────────────────────────────

echo "=== 8. Marquer une commande comme échouée ===" 
curl -X PUT "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET" \
  -d '{
    "orderNumber": "ORD-ANOTHER-ORDER-NUMBER",
    "status": "failed",
    "reference": "FAILED-TXN-99999"
  }'

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# ❌ TESTS D'ERREURS
# ───────────────────────────────────────────────────────────────────────────────

echo "=== ❌ TEST: Appel sans credentials (doit retourner 401) ===" 
curl -X GET "$BASE_URL/api/transactions"

echo -e "\n\n"

echo "=== ❌ TEST: Credentials invalides (doit retourner 403) ===" 
curl -X GET "$BASE_URL/api/transactions" \
  -H "x-api-key: invalid_key" \
  -H "x-api-secret: invalid_secret"

echo -e "\n\n"

echo "=== ❌ TEST: POST sans champs requis (doit retourner 400) ===" 
curl -X POST "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-api-secret: $API_SECRET" \
  -d '{
    "category": "Livres"
  }'

echo -e "\n\n"


# ───────────────────────────────────────────────────────────────────────────────
# 📝 ÉTAPES POUR TESTER MANUELLEMENT
# ───────────────────────────────────────────────────────────────────────────────
# 
# 1. Allez dans le dashboard client et trouvez votre API Key et API Secret
# 2. Remplacez API_KEY et API_SECRET ci-dessus
# 3. Assurez-vous que BASE_URL pointe vers votre application (localhost:3000 ou production)
# 4. Exécutez ce script: bash API_TRANSACTIONS_TEST.sh
# 5. Vérifiez les réponses JSON pour vous assurer que tout fonctionne
# 6. Dans le dashboard client, allez dans /transactions pour voir les commandes
#
# ───────────────────────────────────────────────────────────────────────────────

echo "✅ Tests terminés!"

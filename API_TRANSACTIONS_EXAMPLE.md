/\*\*

- 📚 TRANSACTIONS API DOCUMENTATION
-
- Cette API permet aux clients (partenaires) de créer et mettre à jour les CommandeProducts
- (ventes de produits via leur plateforme) dans le système SaasCandy.
-
- AUTHENTIFICATION
- ───────────────
- L'authentification se fait via les headers d'authentification API :
- - x-api-key: La clé API du client
- - x-api-secret: Le secret API du client
-
- Ces credentials doivent être fournis dans TOUS les appels API vers /api/transactions
  \*/

// ─── 1. CRÉER UNE NOUVELLE COMMANDE (POST) ────────────────────────────────────
/\*\*

- POST /api/transactions
-
- Crée une nouvelle CommandeProduct dans le système
-
- HEADERS REQUIS:
- - x-api-key: string
- - x-api-secret: string
-
- REQUEST BODY:
- {
- category: string, // Catégorie de produit (ex: "Livres", "Uniformes")
- student: string, // Nom de l'étudiant
- classe: string, // Classe de l'étudiant (ex: "6A", "3B")
- amount: number, // Montant en USD
- phone: string, // Numéro de téléphone du contact
- reference: string, // Référence unique de transaction côté client
- description?: string // Description optionnelle
- }
-
- RESPONSE (201):
- {
- success: true,
- message: "Commande created successfully",
- data: {
-     _id: "...",
-     orderNumber: "ORD-1708876543210-ABC123",
-     category: "Livres",
-     student: "Jean Dupont",
-     classe: "6A",
-     amount: 45.50,
-     phone: "+243123456789",
-     status: "pending",
-     reference: "REF-12345",
-     description: "...",
-     createdAt: "2024-02-25T10:30:00Z",
-     updatedAt: "2024-02-25T10:30:00Z"
- }
- }
  \*/

// ─── EXEMPLE: Créer une commande ──────────────────────────────────────────────
async function createCommande() {
const response = await fetch("https://yourapp.com/api/transactions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": "YOUR_API_KEY",
"x-api-secret": "YOUR_API_SECRET",
},
body: JSON.stringify({
category: "Livres",
student: "Jean Dupont",
classe: "6A",
amount: 45.50,
phone: "+243123456789",
reference: "REF-12345",
description: "Manuel de français - 6A",
}),
});

const result = await response.json();
console.log("Commande créée:", result);
// Utilisez result.data.orderNumber pour le suivi ultérieur
}

// ─── 2. METTRE À JOUR UNE COMMANDE (PUT) ──────────────────────────────────────
/\*\*

- PUT /api/transactions
-
- Met à jour le statut d'une CommandeProduct existante
-
- HEADERS REQUIS:
- - x-api-key: string
- - x-api-secret: string
-
- REQUEST BODY:
- {
- orderNumber: string, // L'orderNumber retourné lors de la création
- status: string, // Nouveau statut: "pending" | "completed" | "failed"
- reference?: string // Optionnel: nouvelle référence de transaction
- }
-
- RESPONSE (200):
- {
- success: true,
- message: "Commande updated successfully",
- data: { ... }
- }
  \*/

// ─── EXEMPLE: Mettre à jour une commande ─────────────────────────────────────
async function updateCommande(orderNumber, newStatus) {
const response = await fetch("https://yourapp.com/api/transactions", {
method: "PUT",
headers: {
"Content-Type": "application/json",
"x-api-key": "YOUR_API_KEY",
"x-api-secret": "YOUR_API_SECRET",
},
body: JSON.stringify({
orderNumber: orderNumber, // ex: "ORD-1708876543210-ABC123"
status: newStatus, // "pending" -> "completed" ou "failed"
reference: "PAID-TXN-67890",
}),
});

const result = await response.json();
console.log("Commande mise à jour:", result);
}

// ─── 3. RÉCUPÉRER LES COMMANDES (GET) ──────────────────────────────────────────
/\*\*

- GET /api/transactions
-
- Récupère les CommandeProducts d'un client (utilise les credentials API)
-
- HEADERS REQUIS:
- - x-api-key: string
- - x-api-secret: string
-
- QUERY PARAMETERS (optionnels):
- - orderNumber=ORD-xxx // Filtrer par orderNumber spécifique
- - status=pending // Filtrer par statut
- - category=Livres // Filtrer par catégorie
-
- RESPONSE (200):
- {
- success: true,
- data: [ ... ]
- }
  \*/

// ─── EXEMPLE: Récupérer toutes les commandes ─────────────────────────────────
async function getCommandes() {
const response = await fetch("https://yourapp.com/api/transactions", {
method: "GET",
headers: {
"x-api-key": "YOUR_API_KEY",
"x-api-secret": "YOUR_API_SECRET",
},
});

const result = await response.json();
console.log("Commandes récupérées:", result.data);
}

// ─── EXEMPLE: Récupérer les commandes en attente ────────────────────────────
async function getPendingCommandes() {
const response = await fetch(
"https://yourapp.com/api/transactions?status=pending",
{
method: "GET",
headers: {
"x-api-key": "YOUR_API_KEY",
"x-api-secret": "YOUR_API_SECRET",
},
}
);

const result = await response.json();
console.log("Commandes en attente:", result.data);
}

/\*\*

- 🔒 SÉCURITÉ - NOTES IMPORTANTES
- ──────────────────────────────
-
- 1.  API Key & Secret:
- - Stockez ces credentials de manière sécurisée (variables d'environnement)
- - Ne les exposez JAMAIS en frontend (appels depuis backend uniquement)
- - Générez-les depuis le dashboard client de SaasCandy
-
- 2.  Validation des données:
- - Validez toutes les données avant d'envoyer à l'API
- - Les montants doivent être > 0
- - Tous les champs requis doivent être présents
-
- 3.  Gestion des erreurs:
- - 401: Credentials invalides ou manquants
- - 403: Client inactif ou non autorisé
- - 400: Données invalides
- - 404: Ressource introuvable
- - 500: Erreur serveur
-
- 4.  Retry Logic:
- - Implémentez une stratégie de retry en cas d'échec
- - Utilisez exponential backoff pour les tentatives
-
- 5.  Rate Limiting:
- - À implémenter selon vos besoins
- - Communiquer les limites dans votre SLA
    \*/

/\*\*

- 📊 EXEMPLE D'INTÉGRATION COMPLÈTE
-
- L'exemple suivant montre comment intégrer l'API dans votre plateforme:
  \*/

class TransactionsAPIClient {
private apiKey: string;
private apiSecret: string;
private baseUrl: string = "https://yourapp.com/api/transactions";

constructor(apiKey: string, apiSecret: string) {
this.apiKey = apiKey;
this.apiSecret = apiSecret;
}

private getHeaders(contentType = "application/json") {
return {
"Content-Type": contentType,
"x-api-key": this.apiKey,
"x-api-secret": this.apiSecret,
};
}

async createOrder(orderData) {
try {
const response = await fetch(this.baseUrl, {
method: "POST",
headers: this.getHeaders(),
body: JSON.stringify(orderData),
});

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Create order error:", error);
      throw error;
    }

}

async updateOrder(orderNumber, statusUpdate) {
try {
const response = await fetch(this.baseUrl, {
method: "PUT",
headers: this.getHeaders(),
body: JSON.stringify({
orderNumber,
...statusUpdate,
}),
});

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Update order error:", error);
      throw error;
    }

}

async getOrders(filters = {}) {
try {
const queryString = new URLSearchParams(filters).toString();
const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch orders");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Fetch orders error:", error);
      throw error;
    }

}
}

// ─── Utilisation du client ──────────────────────────────────────────────────
const client = new TransactionsAPIClient(
process.env.SAASCANDY_API_KEY,
process.env.SAASCANDY_API_SECRET
);

// Créer une commande
await client.createOrder({
category: "Livres",
student: "Jean Dupont",
classe: "6A",
amount: 45.50,
phone: "+243123456789",
reference: "REF-12345",
});

// Mettre à jour le statut
await client.updateOrder("ORD-1708876543210-ABC123", {
status: "completed",
reference: "PAID-TXN-67890",
});

// Récupérer les commandes en attente
const pendingOrders = await client.getOrders({ status: "pending" });
console.log("Commandes en attente:", pendingOrders.data);

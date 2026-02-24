/**
 * 🔗 CLIENT SDK - SAASCANDY TRANSACTIONS
 *
 * Classe utilitaire pour intégrer facilement l'API Transactions
 * dans votre plateforme cliente.
 *
 * Usage:
 * ------
 * import { SaaSCandyClient } from './saascandy-client';
 *
 * const client = new SaaSCandyClient({
 *   apiKey: process.env.SAASCANDY_API_KEY,
 *   apiSecret: process.env.SAASCANDY_API_SECRET,
 *   baseUrl: 'https://yourapp.com'
 * });
 *
 * await client.createOrder({ ... });
 * await client.updateOrderStatus(orderNumber, 'completed');
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SaaSCandyConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string; // ex: "https://app.saascandy.com"
}

export interface CreateOrderPayload {
  category: string;
  student: string;
  classe: string;
  amount: number;
  phone: string;
  reference: string; // Unique transaction ID from your platform
  description?: string;
}

export interface UpdateOrderPayload {
  orderNumber: string;
  status: "pending" | "completed" | "failed";
  reference?: string;
}

export interface SaaSCandyOrder {
  _id: string;
  category: string;
  student: string;
  classe: string;
  amount: number;
  orderNumber: string;
  phone: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  description: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaaSCandyResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class SaaSCandyClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(config: SaaSCandyConfig) {
    if (!config.apiKey || !config.apiSecret) {
      throw new Error(
        "SaaSCandy Client: apiKey and apiSecret are required. " +
          "Get them from your SaaSCandy dashboard.",
      );
    }

    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Internal method: Make HTTP requests
   */
  private async request<T>(
    method: "GET" | "POST" | "PUT",
    endpoint: string,
    data?: unknown,
  ): Promise<SaaSCandyResponse<T>> {
    const url = `${this.baseUrl}/api/transactions${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "x-api-secret": this.apiSecret,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const jsonData: SaaSCandyResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(jsonData.error || `HTTP ${response.status}`);
      }

      return jsonData;
    } catch (error: any) {
      console.error(
        `❌ SaaSCandy API Error (${method} ${endpoint}):`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * ✨ CREATE ORDER
   *
   * Créer une nouvelle commande sur SaaSCandy
   *
   * @param payload - Informations de la commande
   * @returns Commande créée avec orderNumber
   *
   * @example
   * const order = await client.createOrder({
   *   category: 'Livres',
   *   student: 'Jean Dupont',
   *   classe: '6A',
   *   amount: 45.50,
   *   phone: '+243123456789',
   *   reference: 'TXN-12345',
   *   description: 'Manuel de français'
   * });
   * console.log('Order created:', order.orderNumber);
   */
  async createOrder(payload: CreateOrderPayload): Promise<SaaSCandyOrder> {
    this.validateCreateOrderPayload(payload);

    const response = await this.request<SaaSCandyOrder>("POST", "", payload);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to create order");
    }

    return response.data;
  }

  /**
   * 🔄 UPDATE ORDER STATUS
   *
   * Mettre à jour le statut d'une commande
   *
   * @param orderNumber - L'orderNumber retourné lors de la création
   * @param status - Nouveau statut: 'pending', 'completed', 'failed'
   * @param reference - Optionnel: référence de transaction mise à jour
   * @returns Commande mise à jour
   *
   * @example
   * const updated = await client.updateOrderStatus(
   *   'ORD-1708876543210-ABC123',
   *   'completed',
   *   'PAID-TXN-67890'
   * );
   */
  async updateOrderStatus(
    orderNumber: string,
    status: "pending" | "completed" | "failed",
    reference?: string,
  ): Promise<SaaSCandyOrder> {
    if (!orderNumber || !status) {
      throw new Error("orderNumber and status are required");
    }

    const payload: UpdateOrderPayload = {
      orderNumber,
      status,
    };

    if (reference) {
      payload.reference = reference;
    }

    const response = await this.request<SaaSCandyOrder>("PUT", "", payload);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to update order");
    }

    return response.data;
  }

  /**
   * 📋 GET ORDERS
   *
   * Récupérer les commandes avec filtres optionnels
   *
   * @param filters - Filtres optionnels
   * @returns Liste des commandes
   *
   * @example
   * // Récupérer toutes les commandes
   * const allOrders = await client.getOrders();
   *
   * // Filtrer par statut
   * const pending = await client.getOrders({ status: 'pending' });
   *
   * // Filtrer par catégorie
   * const books = await client.getOrders({ category: 'Livres' });
   *
   * // Récupérer une commande spécifique
   * const order = await client.getOrders({
   *   orderNumber: 'ORD-1708876543210-ABC123'
   * });
   */
  async getOrders(filters?: {
    orderNumber?: string;
    status?: "pending" | "completed" | "failed";
    category?: string;
  }): Promise<SaaSCandyOrder[]> {
    const params = new URLSearchParams();

    if (filters?.orderNumber) params.append("orderNumber", filters.orderNumber);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);

    const endpoint = params.toString() ? `?${params.toString()}` : "";

    const response = await this.request<SaaSCandyOrder[]>("GET", endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch orders");
    }

    return response.data;
  }

  /**
   * 📊 GET ORDER BY ID
   *
   * Récupérer une commande spécifique
   *
   * @param orderNumber - L'orderNumber de la commande
   * @returns La commande trouvée ou null
   */
  async getOrderByNumber(orderNumber: string): Promise<SaaSCandyOrder | null> {
    try {
      const orders = await this.getOrders({ orderNumber });
      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error("❌ Failed to fetch order:", error);
      return null;
    }
  }

  /**
   * 🏷️  GET ORDERS BY CATEGORY
   *
   * Récupérer les commandes d'une catégorie spécifique
   */
  async getOrdersByCategory(category: string): Promise<SaaSCandyOrder[]> {
    return this.getOrders({ category });
  }

  /**
   * ⏳ GET PENDING ORDERS
   *
   * Récupérer les commandes en attente (status: pending)
   */
  async getPendingOrders(): Promise<SaaSCandyOrder[]> {
    return this.getOrders({ status: "pending" });
  }

  /**
   * ✅ GET COMPLETED ORDERS
   *
   * Récupérer les commandes complétées (status: completed)
   */
  async getCompletedOrders(): Promise<SaaSCandyOrder[]> {
    return this.getOrders({ status: "completed" });
  }

  /**
   * ❌ GET FAILED ORDERS
   *
   * Récupérer les commandes échouées (status: failed)
   */
  async getFailedOrders(): Promise<SaaSCandyOrder[]> {
    return this.getOrders({ status: "failed" });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION METHODS
  // ─────────────────────────────────────────────────────────────────────────

  private validateCreateOrderPayload(payload: CreateOrderPayload): void {
    const required = [
      "category",
      "student",
      "classe",
      "amount",
      "phone",
      "reference",
    ];

    for (const field of required) {
      if (!payload[field as keyof CreateOrderPayload]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (payload.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (payload.phone.length < 5) {
      throw new Error("Invalid phone number");
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EXEMPLE 1: Configuration et utilisation basique
 */
async function example1_basicUsage() {
  const client = new SaaSCandyClient({
    apiKey: process.env.SAASCANDY_API_KEY!,
    apiSecret: process.env.SAASCANDY_API_SECRET!,
    baseUrl: process.env.SAASCANDY_API_URL || "https://app.saascandy.com",
  });

  // Créer une commande
  const order = await client.createOrder({
    category: "Livres",
    student: "Jean Dupont",
    classe: "6A",
    amount: 45.5,
    phone: "+243123456789",
    reference: "TXN-12345",
    description: "Manuel de français",
  });

  console.log("✅ Order created:", order.orderNumber);
  return order;
}

/**
 * EXEMPLE 2: Workflow complet avec paiement
 */
async function example2_paymentWorkflow() {
  const client = new SaaSCandyClient({
    apiKey: process.env.SAASCANDY_API_KEY!,
    apiSecret: process.env.SAASCANDY_API_SECRET!,
    baseUrl: process.env.SAASCANDY_API_URL!,
  });

  try {
    // 1️⃣ Créer la commande
    console.log("📦 Creating order...");
    const order = await client.createOrder({
      category: "Livres",
      student: "Jean Dupont",
      classe: "6A",
      amount: 45.5,
      phone: "+243123456789",
      reference: "TXN-" + Date.now(),
    });

    console.log("✅ Order created:", order.orderNumber);

    // 2️⃣ Simuler le paiement
    console.log("💳 Processing payment...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3️⃣ Mettre à jour le statut
    console.log("🔄 Updating status to completed...");
    const updated = await client.updateOrderStatus(
      order.orderNumber,
      "completed",
      "PAID-" + Date.now(),
    );

    console.log("✅ Order completed:", updated.status);

    // 4️⃣ Récupérer la commande mise à jour
    const fetched = await client.getOrderByNumber(order.orderNumber);
    console.log("📋 Order details:", fetched);

    return fetched;
  } catch (error) {
    console.error("❌ Workflow failed:", error);
    throw error;
  }
}

/**
 * EXEMPLE 3: Gestion des erreurs
 */
async function example3_errorHandling() {
  const client = new SaaSCandyClient({
    apiKey: "invalid_key",
    apiSecret: "invalid_secret",
    baseUrl: "https://app.saascandy.com",
  });

  try {
    // Ceci devrait échouer avec 403 Forbidden
    await client.createOrder({
      category: "Livres",
      student: "Jean",
      classe: "6A",
      amount: 50,
      phone: "+243123456789",
      reference: "TEST",
    });
  } catch (error: any) {
    console.error("❌ Expected error:", error.message);
    // Handle error here
  }
}

/**
 * EXEMPLE 4: Récupérer les statistiques
 */
async function example4_statistics() {
  const client = new SaaSCandyClient({
    apiKey: process.env.SAASCANDY_API_KEY!,
    apiSecret: process.env.SAASCANDY_API_SECRET!,
    baseUrl: process.env.SAASCANDY_API_URL!,
  });

  // Récupérer les commandes par statut
  const pending = await client.getPendingOrders();
  const completed = await client.getCompletedOrders();
  const failed = await client.getFailedOrders();

  console.log("📊 Statistics:");
  console.log(`   Pending: ${pending.length}`);
  console.log(`   Completed: ${completed.length}`);
  console.log(`   Failed: ${failed.length}`);

  // Calculer le revenu total
  const totalRevenue = completed.reduce((sum, order) => sum + order.amount, 0);
  console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);
}

/**
 * EXEMPLE 5: Gestion par catégorie
 */
async function example5_byCat() {
  const client = new SaaSCandyClient({
    apiKey: process.env.SAASCANDY_API_KEY!,
    apiSecret: process.env.SAASCANDY_API_SECRET!,
    baseUrl: process.env.SAASCANDY_API_URL!,
  });

  // Récupérer les ventes par catégorie
  const categories = ["Livres", "Uniformes", "Fournitures"];

  const stats = await Promise.all(
    categories.map(async (cat) => {
      const orders = await client.getOrdersByCategory(cat);
      const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
      return { category: cat, count: orders.length, revenue };
    }),
  );

  console.log("📊 Sales by Category:");
  stats.forEach((stat) => {
    console.log(
      `   ${stat.category}: ${stat.count} orders, $${stat.revenue.toFixed(2)}`,
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default SaaSCandyClient;

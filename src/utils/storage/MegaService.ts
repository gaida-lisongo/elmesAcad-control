import { Storage } from "megajs";
import { Readable } from "node:stream";

type MegaUploadResult = any; // tu peux typer plus finement si tu veux

class MegaService {
  private static instance: MegaService;
  private storage: any | null = null;
  private isConnected = false;
  private connectPromise: Promise<any> | null = null;

  private constructor() {}

  static getInstance() {
    if (!MegaService.instance) {
      MegaService.instance = new MegaService();
    }
    return MegaService.instance;
  }

  /**
   * Connexion MEGA unique par process (singleton + mutex via connectPromise).
   */
  async connect() {
    if (this.isConnected && this.storage) return this.storage;
    if (this.connectPromise) return this.connectPromise;

    const email = process.env.MEGA_EMAIL;
    const password = process.env.MEGA_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Missing MEGA_EMAIL or MEGA_PASSWORD in environment variables.",
      );
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const storage = new Storage({ email, password }, (err: any) => {
        if (err) {
          this.connectPromise = null;
          return reject(err);
        }
        this.storage = storage;
        this.isConnected = true;
        console.log("☁️ MegaService: Connected (Singleton)");
        resolve(storage);
      });
    });

    return this.connectPromise;
  }

  /**
   * Upload depuis un Buffer (idéal en Next.js server)
   */
  async uploadBuffer(
    name: string,
    inputBuffer: any,
  ): Promise<MegaUploadResult> {
    const storage = await this.connect();

    // Assurer qu'on a un vrai Buffer
    let buffer: Buffer;
    if (Buffer.isBuffer(inputBuffer)) {
      buffer = inputBuffer;
    } else if (inputBuffer instanceof ArrayBuffer) {
      buffer = Buffer.from(new Uint8Array(inputBuffer));
    } else if (inputBuffer instanceof Uint8Array) {
      buffer = Buffer.from(inputBuffer);
    } else {
      buffer = Buffer.from(inputBuffer);
    }

    const size = buffer.length;

    return new Promise((resolve, reject) => {
      // Créer un stream lisible avec allowUploadBuffering
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      // Upload à la racine (storage.root) — à adapter si tu veux un dossier.
      storage.upload(
        { name, size, allowUploadBuffering: true },
        stream,
        (err: any, file: any) => {
          if (err) return reject(err);
          resolve(file);
        },
      );
    });
  }

  /**
   * Upload depuis un File Web (FormData) - convertit en Buffer
   */
  async uploadFile(file: File): Promise<MegaUploadResult> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return this.uploadBuffer(file.name, buffer);
  }

  /**
   * Générer un lien public
   */
  async getLink(file: any): Promise<string> {
    try {
      return await file.link();
    } catch (error: any) {
      throw new Error(
        "Erreur de génération du lien : " + (error?.message ?? String(error)),
      );
    }
  }
}

export const megaService = MegaService.getInstance();

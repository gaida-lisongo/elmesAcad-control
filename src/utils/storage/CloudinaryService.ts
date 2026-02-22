import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

class CloudinaryService {
  private static instance: CloudinaryService;

  private constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Missing Cloudinary env vars (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)",
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  static getInstance() {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  /**
   * Upload d’une image depuis un Buffer (server-side)
   */
  async uploadBuffer(
    buffer: Buffer,
    options?: {
      folder?: string;
      publicId?: string;
      overwrite?: boolean;
      resourceType?: "image";
    },
  ) {
    const folder = options?.folder ?? "ent-control-plane/profiles";
    const publicId = options?.publicId;
    const overwrite = options?.overwrite ?? true;

    return new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite,
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload direct depuis un File Web (FormData)
   */
  async uploadFile(file: File, folder = "ent-control-plane/profiles") {
    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);
    return this.uploadBuffer(buffer, { folder });
  }

  /**
   * Suppression par public_id (le plus fiable)
   */
  async deleteByPublicId(publicId: string) {
    if (!publicId) return { result: "empty_public_id" };
    return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }

  /**
   * (Optionnel) Helper: extraire public_id depuis une URL Cloudinary
   * ⚠️ fragile si transformations ou structure différente
   */
  extractPublicIdFromUrl(url: string) {
    // Exemple URL: https://res.cloudinary.com/<cloud>/image/upload/v1234567890/folder/name.jpg
    const marker = "/upload/";
    const idx = url.indexOf(marker);
    if (idx === -1) throw new Error("Not a Cloudinary upload URL");

    const afterUpload = url.substring(idx + marker.length); // v123/.../folder/name.jpg
    const parts = afterUpload.split("/");
    // enlever v123...
    if (parts[0].startsWith("v")) parts.shift();

    const filename = parts.pop()!;
    const folderPath = parts.join("/");
    const nameWithoutExt = filename.split(".")[0];

    return folderPath ? `${folderPath}/${nameWithoutExt}` : nameWithoutExt;
  }
}

export const cloudinaryService = CloudinaryService.getInstance();

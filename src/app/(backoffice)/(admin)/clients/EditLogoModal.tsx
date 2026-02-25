"use client";
import { Icon } from "@iconify/react";
import { useState, useRef } from "react";
import Image from "next/image";
import { updateClientLogo } from "@/lib/actions/clients-management-actions";

interface EditLogoModalProps {
  clientId: string;
  currentLogo: string | null;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLogoModal({
  clientId,
  currentLogo,
  clientName,
  onClose,
  onSuccess,
}: EditLogoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Veuillez sélectionner une image");
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessageType("error");
      setMessage("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!preview) {
      setMessageType("error");
      setMessage("Veuillez sélectionner une image");
      setIsLoading(false);
      return;
    }

    try {
      // Extraire le base64 du data URL
      const base64 = preview.split(",")[1] || preview;

      const result = await updateClientLogo(clientId, base64);

      if (result.success) {
        setMessageType("success");
        setMessage("Logo mis à jour avec succès!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(result.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-darklight rounded-3xl max-w-md w-full border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder">
          <h3 className="text-midnight_text dark:text-white font-semibold text-lg">
            Modifier le logo
          </h3>
          <button
            onClick={onClose}
            className="text-dark/50 dark:text-white/50 hover:text-midnight_text dark:hover:text-white"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-darkborder flex items-center justify-center bg-grey dark:bg-darkmode">
              {preview ? (
                <Image
                  src={preview}
                  alt={clientName}
                  fill
                  className="object-cover"
                />
              ) : (
                <Icon
                  icon="heroicons:image"
                  className="w-8 h-8 text-dark/30 dark:text-white/30"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              Sélectionner une image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                messageType === "success"
                  ? "bg-success/10 text-success"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-darkborder text-midnight_text dark:text-white rounded-lg hover:bg-grey dark:hover:bg-darkmode transition-colors font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isLoading || !preview}
            >
              {isLoading && (
                <Icon
                  icon="heroicons:arrow-path"
                  className="w-4 h-4 animate-spin"
                />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

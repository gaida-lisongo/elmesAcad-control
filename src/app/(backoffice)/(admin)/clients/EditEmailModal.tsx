"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { updateClientEmail } from "@/lib/actions/clients-management-actions";

interface EditEmailModalProps {
  clientId: string;
  currentEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEmailModal({
  clientId,
  currentEmail,
  onClose,
  onSuccess,
}: EditEmailModalProps) {
  const [email, setEmail] = useState(currentEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const result = await updateClientEmail(clientId, email);

      if (result.success) {
        setMessageType("success");
        setMessage("Email mis à jour avec succès!");
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
            Modifier l'email
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
          <div>
            <label className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
              Nouvel email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white focus:outline-none focus:border-primary"
              required
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
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              disabled={isLoading}
            >
              {isLoading ? "..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface IntegrationModalProps {
  client: any;
  onClose: () => void;
}

export default function IntegrationModal({
  client,
  onClose,
}: IntegrationModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-darklight rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder sticky top-0 bg-white dark:bg-darklight">
          <h3 className="text-midnight_text dark:text-white font-semibold text-lg">
            Informations d'intégration
          </h3>
          <button
            onClick={onClose}
            className="text-dark/50 dark:text-white/50 hover:text-midnight_text dark:hover:text-white"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Name */}
          <div>
            <p className="text-xs font-semibold text-dark/60 dark:text-white/60 uppercase mb-2">
              Entreprise
            </p>
            <p className="text-midnight_text dark:text-white font-medium">
              {client.nomComplet}
            </p>
          </div>

          {/* UUID */}
          <div>
            <p className="text-xs font-semibold text-dark/60 dark:text-white/60 uppercase mb-2">
              UUID
            </p>
            <div className="flex items-center gap-3 p-3 bg-grey dark:bg-darkmode rounded-lg">
              <code className="flex-1 text-sm font-mono text-midnight_text dark:text-white break-all">
                {client.uuid}
              </code>
              <button
                onClick={() => handleCopy(client.uuid, "uuid")}
                className="flex-shrink-0 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Copier"
              >
                <Icon
                  icon={
                    copied === "uuid"
                      ? "heroicons:check-20-solid"
                      : "heroicons:document-duplicate-20-solid"
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <p className="text-xs font-semibold text-dark/60 dark:text-white/60 uppercase mb-2">
              API Key
            </p>
            <div className="flex items-center gap-3 p-3 bg-grey dark:bg-darkmode rounded-lg">
              <code className="flex-1 text-sm font-mono text-midnight_text dark:text-white break-all">
                {client.apiKey}
              </code>
              <button
                onClick={() => handleCopy(client.apiKey, "apiKey")}
                className="flex-shrink-0 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Copier"
              >
                <Icon
                  icon={
                    copied === "apiKey"
                      ? "heroicons:check-20-solid"
                      : "heroicons:document-duplicate-20-solid"
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div>
            <p className="text-xs font-semibold text-dark/60 dark:text-white/60 uppercase mb-2">
              API Secret
            </p>
            <div className="flex items-center gap-3 p-3 bg-grey dark:bg-darkmode rounded-lg">
              <code className="flex-1 text-sm font-mono text-midnight_text dark:text-white break-all">
                {client.apiSecret}
              </code>
              <button
                onClick={() => handleCopy(client.apiSecret, "apiSecret")}
                className="flex-shrink-0 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Copier"
              >
                <Icon
                  icon={
                    copied === "apiSecret"
                      ? "heroicons:check-20-solid"
                      : "heroicons:document-duplicate-20-solid"
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* Logo URL */}
          {client.logo && (
            <div>
              <p className="text-xs font-semibold text-dark/60 dark:text-white/60 uppercase mb-2">
                URL du Logo
              </p>
              <div className="flex items-center gap-3 p-3 bg-grey dark:bg-darkmode rounded-lg">
                <code className="flex-1 text-sm font-mono text-midnight_text dark:text-white break-all">
                  {client.logo}
                </code>
                <button
                  onClick={() => handleCopy(client.logo, "logo")}
                  className="flex-shrink-0 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Copier"
                >
                  <Icon
                    icon={
                      copied === "logo"
                        ? "heroicons:check-20-solid"
                        : "heroicons:document-duplicate-20-solid"
                    }
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

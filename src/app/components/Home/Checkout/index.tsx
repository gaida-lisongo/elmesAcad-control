"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import {
  createClientProspect,
  createCommandePackage,
  activateClientAfterPayment,
  updateCommandeStatus,
  updateCommandeOrderNumber,
} from "@/lib/actions/home/checkout-actions";

interface CheckoutProps {
  packages: any;
  selectedPackage: any;
  onClose: () => void;
}

type Step = "info" | "payment" | "success" | "error";

interface ClientData {
  nomComplet: string;
  email: string;
  logo?: File;
}

interface CommandeData {
  userId: string;
  packageId: string;
  amount: number;
  phone: string;
  email: string;
  password: string;
}

const Checkout = ({ packages, selectedPackage, onClose }: CheckoutProps) => {
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Mémoire des credentials pour affichage
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    apiKey: string;
    orderNumber?: string;
  } | null>(null);

  // Étape 1: Information Client
  const [clientData, setClientData] = useState<ClientData>({
    nomComplet: "",
    email: "",
  });
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Étape 2: Payment
  const [paymentData, setPaymentData] = useState({
    phone: "",
  });

  const [commandeData, setCommandeData] = useState<CommandeData | null>(null);

  // ─── Handle Logo Upload ────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClientData({ ...clientData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Step 1: Continue to Payment ────────────────────────────────────
  const handleContinueToPayment = async () => {
    if (!clientData.nomComplet || !clientData.email) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createClientProspect({
        nomComplet: clientData.nomComplet,
        email: clientData.email,
        logoFile: clientData.logo || null,
      });

      if (result.success) {
        setCommandeData({
          userId: result.data._id,
          packageId: selectedPackage._id,
          amount: selectedPackage.price,
          phone: paymentData.phone,
          email: result.data.email,
          password: result.data.password,
        });
        setStep("payment");
      } else {
        setError(result.error || "Erreur lors de la création du compte.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Process Payment ───────────────────────────────────────
  const handleProcessPayment = async () => {
    if (!paymentData.phone) {
      setError("Veuillez entrer un numéro de téléphone.");
      return;
    }

    if (!commandeData) {
      setError("Erreur: données de commande manquantes.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Créer la commande
      const reference = `MOBILE_${Date.now()}`;
      const commandeResult = await createCommandePackage({
        packageId: commandeData.packageId,
        userId: commandeData.userId,
        amount: commandeData.amount,
        phone: paymentData.phone,
        email: commandeData.email,
        reference,
      });

      if (!commandeResult.success) {
        setError(
          commandeResult.error || "Erreur lors de la création de la commande.",
        );
        setStep("error");
        return;
      }

      // Appeler l'endpoint /api/flexpay (client faire appel à l'API)
      const paymentRes = await fetch("/api/flexpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: commandeData.amount,
          phone: paymentData.phone,
          reference,
          type: "MOBILE",
        }),
      });

      if (!paymentRes.ok) {
        throw new Error(`Erreur API: ${paymentRes.status}`);
      }

      const paymentResult = await paymentRes.json();

      console.log("✅ Payment API Response:", paymentResult);

      if (paymentResult.success) {
        const flexPayOrderNumber = paymentResult.data?.orderNumber;

        // Mettre à jour l'orderNumber avec celui de FlexPay
        if (flexPayOrderNumber) {
          await updateCommandeOrderNumber(
            commandeResult.data._id,
            flexPayOrderNumber,
          );
        }

        // Activer le client
        await activateClientAfterPayment(
          commandeData.userId,
          commandeData.password,
        );

        // Stockage des credentials pour affichage
        setCredentials({
          email: commandeData.email,
          password: commandeData.password,
          apiKey: commandeData.password, // À adapter selon votre logique
          orderNumber: flexPayOrderNumber,
        });

        setSuccessMessage(
          "Félicitations! Votre paiement a été traité avec succès. Un email de confirmation avec vos identifiants a été envoyé.",
        );
        setStep("success");
      } else {
        setError(
          paymentResult.message ||
            paymentResult.error ||
            "Erreur lors du paiement.",
        );
        await updateCommandeStatus(commandeResult.data._id, "failed");
        setStep("error");
      }
    } catch (err: any) {
      console.error("❌ Erreur paiement:", err);
      setError(err.message || "Erreur lors du paiement.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render Step 1: Information Client ──────────────────────────────
  if (step === "info") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-darklight p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-black dark:text-white">
              Étape 1: Informations Client
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white disabled:opacity-50"
            >
              <Icon icon="mdi:close" width={22} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Main Content: 3/5 - Package Details | 2/5 - Client Form */}
          <div className="grid grid-cols-5 gap-6">
            {/* Package Details (3/5) */}
            <div className="col-span-3">
              <div className="bg-grey dark:bg-darkmode rounded-xl p-6">
                <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                  {selectedPackage.type}
                </h4>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-black/50 dark:text-white/50 text-sm mb-1">
                    Montant
                  </p>
                  <h3 className="text-4xl font-bold text-primary">
                    ${selectedPackage.price}
                  </h3>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-black/50 dark:text-white/50 text-sm mb-1">
                    Description
                  </p>
                  <p className="text-black dark:text-white">
                    {selectedPackage.text}
                  </p>
                </div>

                {/* Benefits */}
                {selectedPackage.benefits &&
                  selectedPackage.benefits.length > 0 && (
                    <div className="mb-6">
                      <p className="text-black dark:text-white font-semibold mb-3">
                        Modules inclus
                      </p>
                      <ul className="space-y-2">
                        {selectedPackage.benefits.map(
                          (benefit: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Icon
                                icon="solar:check-circle-linear"
                                width="16"
                                className="text-primary flex-shrink-0"
                              />
                              <span className="text-black dark:text-white text-sm">
                                {benefit}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {/* Features */}
                {selectedPackage.features &&
                  selectedPackage.features.length > 0 && (
                    <div>
                      <p className="text-black dark:text-white font-semibold mb-3">
                        Fonctionnalités
                      </p>
                      <ul className="space-y-2">
                        {selectedPackage.features.map(
                          (feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Icon
                                icon="solar:check-circle-linear"
                                width="16"
                                className="text-success flex-shrink-0"
                              />
                              <span className="text-black dark:text-white text-sm">
                                {feature}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            {/* Client Form (2/5) */}
            <div className="col-span-2">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    value={clientData.nomComplet}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        nomComplet: e.target.value,
                      })
                    }
                    placeholder="Votre nom"
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) =>
                      setClientData({ ...clientData, email: e.target.value })
                    }
                    placeholder="votre@email.com"
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white text-sm"
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                    Logo (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full text-xs text-black/60 dark:text-white/60 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-white file:text-xs file:cursor-pointer"
                  />
                </div>

                {/* Logo Preview */}
                {logoPreview && (
                  <div className="rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 p-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-24 object-contain"
                    />
                  </div>
                )}

                {/* Phone for Payment */}
                <div>
                  <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                    Téléphone (pour paiement) *
                  </label>
                  <input
                    type="tel"
                    value={paymentData.phone}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, phone: e.target.value })
                    }
                    placeholder="+243..."
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleContinueToPayment}
                    disabled={loading}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-orange-600 duration-300 disabled:opacity-50 font-semibold"
                  >
                    {loading ? "Chargement..." : "Continuer"}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700 duration-300 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Step 2: Payment ────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-darklight p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-black dark:text-white">
              Étape 2: Confirmation Paiement
            </h3>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Payment Form */}
          <div className="space-y-4 mb-6">
            {/* Summary */}
            <div className="bg-grey dark:bg-darkmode rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-black/60 dark:text-white/60">
                  Package:
                </span>
                <span className="font-semibold text-black dark:text-white">
                  {selectedPackage.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60 dark:text-white/60">
                  Montant:
                </span>
                <span className="font-semibold text-black dark:text-white">
                  ${selectedPackage.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60 dark:text-white/60">Email:</span>
                <span className="text-black dark:text-white text-sm">
                  {commandeData?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60 dark:text-white/60">
                  Téléphone:
                </span>
                <span className="text-black dark:text-white text-sm">
                  {paymentData.phone}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <Icon
                  icon="mdi:information"
                  className="inline mr-2"
                  width={16}
                />
                Le paiement sera traité via FlexPay (Mobile Money). Vous
                recevrez une notification de confirmation.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleProcessPayment}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white hover:bg-orange-600 duration-300 disabled:opacity-50 font-semibold"
            >
              {loading ? "Traitement..." : "Confirmer & Payer"}
            </button>
            <button
              onClick={() => setStep("info")}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 duration-300 disabled:opacity-50"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Step 3: Success ────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-darklight p-8 shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon
                icon="solar:check-circle-linear"
                width={40}
                className="text-success"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-semibold text-black dark:text-white mb-2 text-center">
            Félicitations!
          </h3>

          {/* Message */}
          <p className="text-black/60 dark:text-white/60 mb-8 text-center">
            {successMessage}
          </p>

          {/* Credentials Card */}
          {credentials && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon
                  icon="mdi:shield-account"
                  width={20}
                  className="text-blue-600 dark:text-blue-400"
                />
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                  Vos identifiants de connexion
                </h4>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                    Email:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white dark:bg-darkmode px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-black dark:text-white">
                      {credentials.email}
                    </div>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(credentials.email)
                      }
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                    >
                      <Icon icon="mdi:content-copy" width={18} />
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                    Mot de passe:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white dark:bg-darkmode px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-black dark:text-white">
                      {credentials.password}
                    </div>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(credentials.password)
                      }
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                    >
                      <Icon icon="mdi:content-copy" width={18} />
                    </button>
                  </div>
                </div>

                {/* API Key */}
                {credentials.apiKey && (
                  <div>
                    <label className="block text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                      Clé API:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white dark:bg-darkmode px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs text-black dark:text-white truncate">
                        {credentials.apiKey}
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            credentials.apiKey || "",
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                      >
                        <Icon icon="mdi:content-copy" width={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Number */}
                {credentials.orderNumber && (
                  <div>
                    <label className="block text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                      N° de commande FlexPay:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white dark:bg-darkmode px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-black dark:text-white">
                        {credentials.orderNumber}
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            credentials.orderNumber || "",
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                      >
                        <Icon icon="mdi:content-copy" width={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <Icon
                    icon="mdi:information"
                    className="inline mr-1"
                    width={14}
                  />
                  Ces identifiants ont également été envoyés à votre adresse
                  email. Conservez-les en sécurité.
                </p>
              </div>
            </div>
          )}

          {/* Action */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg bg-primary text-white hover:bg-orange-600 duration-300 font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // ─── Render Step 3: Error ───────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darklight p-6 shadow-xl text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Icon
                icon="solar:close-circle-linear"
                width={40}
                className="text-red-500"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">
            Une erreur s'est produite
          </h3>

          {/* Message */}
          <p className="text-black/60 dark:text-white/60 mb-6">{error}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("payment")}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white hover:bg-orange-600 duration-300 font-semibold"
            >
              Réessayer
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 duration-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Checkout;

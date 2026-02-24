"use client";

import React, { useState } from "react";
import Hero from "@/app/components/Home/Hero";
import Services from "@/app/components/Home/Services";
import Features from "@/app/components/Home/Features";
import ProductDoc from "@/app/components/Home/ProductDoc";
import Plan from "@/app/components/Home/Plans";
import FAQ from "@/app/components/Home/FAQ";
import Info from "@/app/components/Home/Info";
import Partners from "@/app/components/Home/Partner";
import Checkout from "@/app/components/Home/Checkout";

interface SelectedPackage {
  _id?: string;
  type: string;
  price: number;
  text: string;
  benefits: string[];
  avantages?: string[];
  features?: string[];
}

export default function HomeContent() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<SelectedPackage | null>(null);

  const handleSelectPackage = (pkg: SelectedPackage) => {
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedPackage(null);
  };

  return (
    <main>
      <Hero />
      <Services />
      <Features />
      <Plan onSelectPackage={handleSelectPackage} />
      <ProductDoc />
      <FAQ />
      <Info />
      <Partners />

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedPackage && (
        <Checkout
          packages={[]}
          selectedPackage={selectedPackage}
          onClose={handleCloseCheckout}
        />
      )}
    </main>
  );
}

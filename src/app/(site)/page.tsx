import React from "react";
import { Metadata } from "next";
import HomeContent from "@/app/components/Home/HomeContent";
import { getHero } from "@/lib/actions/home/hero-actions";

export const metadata: Metadata = {
  title: "Accueil | ElmesAcad",
};

export default async function Home() {
  const heroData = await getHero();

  return <HomeContent data={heroData?.data} />;
}

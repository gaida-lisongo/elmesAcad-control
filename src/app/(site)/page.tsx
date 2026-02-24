import React from "react";
import { Metadata } from "next";
import HomeContent from "@/app/components/Home/HomeContent";

export const metadata: Metadata = {
  title: "SaasCandy",
};

export default function Home() {
  return <HomeContent />;
}

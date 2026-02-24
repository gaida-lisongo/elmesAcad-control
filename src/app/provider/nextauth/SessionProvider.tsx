"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { AuthInitializer } from "@/app/components/AuthInitializer";

export default function SessionProviderComp({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <>
      <SessionProvider session={session}>
        <AuthInitializer />
        {children}
      </SessionProvider>
    </>
  );
}

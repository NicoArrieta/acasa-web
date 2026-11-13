"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WhatsAppButton from "./WhatsAppButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isGateway = pathname === "/";

  if (isAdmin) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  if (isGateway) {
    return (
      <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-black">
        <main className="h-full w-full">{children}</main>
        <CartDrawer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-[10vh] bg-black" />}>
        <Navbar />
      </Suspense>
      <CartDrawer />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

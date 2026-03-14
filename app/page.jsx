"use client";

/**
 * app/page.jsx
 * Root page — ParkingProvider + AppShell.
 * Background class switches between pearl-bg and midnight-bg
 * based on the active theme.
 */

import { AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ParkingProvider } from "@/context/ParkingContext";
import { useFirebaseSim } from "@/hooks/useFirebaseSim";
import MapComponent from "@/components/Map/MapComponent";
import BookingFlow from "@/components/Booking/BookingFlow";
import QRTicket from "@/components/Ticket/QRTicket";
import DiscoveryPanel from "@/components/Discovery/DiscoveryPanel";
import { BottomNav, SideRail } from "@/components/Navigation/Navigation";

function AppShell() {
  useFirebaseSim();
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`relative w-screen h-dvh overflow-hidden ${
        resolvedTheme === "light" ? "pearl-bg" : "midnight-bg"
      }`}
    >
      {/* Desktop side rail */}
      <SideRail />

      {/* Main viewport */}
      <main className="absolute inset-0 md:left-[72px] pb-[64px] md:pb-0">
        <MapComponent />
        <DiscoveryPanel />
      </main>

      {/* Booking state machine */}
      <AnimatePresence mode="wait">
        <BookingFlow />
      </AnimatePresence>

      {/* QR Ticket */}
      <AnimatePresence>
        <QRTicket />
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

export default function SmartParkingPage() {
  return (
    <ParkingProvider>
      <AppShell />
    </ParkingProvider>
  );
}
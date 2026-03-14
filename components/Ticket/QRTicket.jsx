"use client";

/**
 * components/Ticket/QRTicket.jsx
 *
 * Dual appearance via CSS variables + .ticket-card class:
 * 🌤 Light/Pearl:         Clean white paper boarding pass
 * 🌌 Dark/Midnight Jewel: Glassmorphic card with teal glow border
 *
 * ✅ qrcode.react QR code
 * ✅ Perforation divider
 * ✅ Share API / clipboard
 * ✅ Get Directions
 */

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useTheme } from "next-themes";
import {
  X, MapPin, Clock, Car, Calendar, CheckCircle2,
  Share2, Navigation, Hash, CreditCard,
} from "lucide-react";
import { useParkingContext, BOOKING_STEPS } from "@/context/ParkingContext";
import { formatINR, formatTimestamp, formatTimeOnly, formatDuration } from "@/utils/formatters";

export default function QRTicket() {
  const { bookingStep, bookingDetails, resetBooking } = useParkingContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleShare = useCallback(async () => {
    if (!bookingDetails) return;
    const text = [
      "🅿 SmartPark Ticket",
      `📍 ${bookingDetails.lot.name}`,
      `🎫 ${bookingDetails.bookingId}`,
      `🚗 Slot ${bookingDetails.slotLabel}`,
      `🕐 ${formatTimestamp(bookingDetails.timestamp)}`,
    ].join("\n");
    try {
      if (navigator.share) await navigator.share({ title: "My Parking Ticket", text });
      else await navigator.clipboard.writeText(text);
    } catch (_) {}
  }, [bookingDetails]);

  if (bookingStep !== BOOKING_STEPS.TICKET || !bookingDetails) return null;

  const { lot, slotLabel, duration, totalAmount, bookingId, timestamp, cardLast4 } = bookingDetails;
  const expiryTs  = timestamp + duration * 60 * 60 * 1000;
  const qrPayload = JSON.stringify({ id: bookingId, lot: lot.id, slot: slotLabel, exp: expiryTs });

  // QR code colors adapt to theme
  const qrBg  = isDark ? "#1E293B" : "#ffffff";
  const qrFg  = isDark ? "#2DD4BF" : "#1E1B4B";

  return (
    <AnimatePresence>
      <motion.div
        key="ticket"
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(12px)" }}
          onClick={resetBooking}
        />

        {/* Ticket */}
        <motion.div
          className="relative w-full max-w-sm mx-3 z-10 max-h-[96vh] overflow-y-auto"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
        >
          {/* Close */}
          <div className="flex justify-end mb-2 px-1">
            <button
              onClick={resetBooking}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}
            >
              <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* ─── TICKET CARD ─── */}
          <div className="ticket-card rounded-3xl overflow-hidden">

            {/* ── TICKET HEADER ── */}
            <div
              className="relative px-5 pt-5 pb-6 overflow-hidden"
              style={{ background: "var(--ticket-header)" }}
            >
              {/* Decorative shapes */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30"
                style={{ background: "var(--accent-available)" }}
              />
              <div
                className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full opacity-20"
                style={{ background: "var(--accent-indigo)" }}
              />

              <div className="relative z-10">
                {/* Brand + status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--accent-indigo-soft)", border: "1px solid var(--border-strong)" }}
                    >
                      <span className="text-sm font-black" style={{ color: "var(--accent-indigo)" }}>P</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      SmartPark
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{
                      background: "var(--accent-glow)",
                      border: "1px solid var(--accent-available)",
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" style={{ color: "var(--accent-available)" }} />
                    <span className="text-[11px] font-bold tracking-wide" style={{ color: "var(--accent-available)" }}>
                      CONFIRMED
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-black mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {lot.name}
                </h2>
                <p className="text-sm flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  <MapPin className="w-3.5 h-3.5" /> {lot.address}
                </p>

                {/* Slot highlight */}
                <div
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}
                >
                  <Car className="w-4 h-4" style={{ color: "var(--accent-available)" }} />
                  <div>
                    <p className="text-[10px] leading-none mb-0.5" style={{ color: "var(--text-muted)" }}>
                      YOUR SLOT
                    </p>
                    <p className="text-lg font-black leading-none" style={{ color: "var(--text-primary)" }}>
                      {slotLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PERFORATION ── */}
            <TicketPerforation isDark={isDark} />

            {/* ── TICKET BODY ── */}
            <div className="px-5 pt-5 pb-6">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div
                  className="rounded-2xl p-3.5"
                  style={{
                    background: qrBg,
                    border: isDark
                      ? "1px solid rgba(45,212,191,0.3)"
                      : "1px solid rgba(30,27,75,0.1)",
                    boxShadow: isDark ? "0 0 20px rgba(45,212,191,0.12)" : "none",
                  }}
                >
                  <QRCodeSVG
                    value={qrPayload}
                    size={148}
                    bgColor={qrBg}
                    fgColor={qrFg}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              <p
                className="text-center text-[11px] mb-5"
                style={{ color: "var(--text-muted)" }}
              >
                Scan at entry gate · Valid until {formatTimeOnly(expiryTs)}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <TicketDetail icon={<Hash className="w-3 h-3" />}       label="Booking ID" value={bookingId} mono />
                <TicketDetail icon={<Calendar className="w-3 h-3" />}   label="Check-in"  value={formatTimeOnly(timestamp)} />
                <TicketDetail icon={<Clock className="w-3 h-3" />}      label="Check-out" value={formatTimeOnly(expiryTs)} />
                <TicketDetail icon={<Clock className="w-3 h-3" />}      label="Duration"  value={formatDuration(duration)} />
                <TicketDetail icon={<CreditCard className="w-3 h-3" />} label="Paid via"  value={`•••• ${cardLast4}`} />
                <TicketDetail
                  icon={<CheckCircle2 className="w-3 h-3" />}
                  label="Status"
                  value="Confirmed"
                  accent="var(--accent-available)"
                />
              </div>

              {/* Total */}
              <div
                className="rounded-2xl px-4 py-3.5 mb-5 flex items-center justify-between"
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid var(--accent-available)",
                }}
              >
                <div>
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-muted)" }}>Total Paid</p>
                  <p className="text-2xl font-black" style={{ color: "var(--accent-available)" }}>
                    {formatINR(totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-muted)" }}>Date</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {new Date(timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              {/* Directions */}
              <a
                href={`https://maps.google.com/?q=${lot.coordinates.lat},${lot.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium mb-3 transition-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-secondary)",
                }}
              >
                <Navigation className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
                Get Directions
              </a>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-semibold transition-none"
                  style={{
                    background: "var(--accent-indigo-soft)",
                    border: "1px solid var(--accent-indigo)",
                    color: "var(--accent-indigo)",
                  }}
                >
                  <Share2 className="w-4 h-4" /> Share
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={resetBooking}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white text-sm font-bold transition-none"
                  style={{
                    background: "var(--accent-available)",
                    boxShadow: "0 4px 12px var(--accent-glow)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Done
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────

function TicketPerforation({ isDark }) {
  const notchBg = isDark ? "#0F172A" : "#F0F4F8";
  return (
    <div className="flex items-center" style={{ background: "var(--ticket-bg)" }}>
      <div className="w-5 h-5 rounded-full shrink-0 -ml-2.5" style={{ background: notchBg }} />
      <div className="flex-1 border-t-2 border-dashed mx-1" style={{ borderColor: "var(--border-strong)" }} />
      <div className="w-5 h-5 rounded-full shrink-0 -mr-2.5" style={{ background: notchBg }} />
    </div>
  );
}

function TicketDetail({ icon, label, value, mono = false, accent }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p
        className="flex items-center gap-1 text-[10px] mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        {icon}{label}
      </p>
      <p
        className={`text-sm font-bold truncate ${mono ? "font-mono text-xs" : ""}`}
        style={{ color: accent || "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
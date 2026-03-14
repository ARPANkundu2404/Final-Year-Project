/**
 * utils/formatters.js
 * Pure utility functions — no React, no side effects.
 * getAvailabilityInfo returns raw hex colors (not CSS vars)
 * because it's used in both CSS inline styles and Mapbox markers.
 * Theme-specific palette selection happens in mapHelpers.js.
 */

// ─────────────────────────────────────────────────────
// CURRENCY
// ─────────────────────────────────────────────────────

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────────────
// DISTANCE
// ─────────────────────────────────────────────────────

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return (deg * Math.PI) / 180; }

export function formatDistance(km) {
  if (km == null) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─────────────────────────────────────────────────────
// TIME
// ─────────────────────────────────────────────────────

export function formatDuration(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return hours === 1 ? "1 hr" : `${hours} hrs`;
}

export function formatTimestamp(ts) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function formatTimeOnly(ts) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

// ─────────────────────────────────────────────────────
// BOOKING ID
// ─────────────────────────────────────────────────────

export function generateBookingId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SP-${ts}-${rand}`;
}

// ─────────────────────────────────────────────────────
// AVAILABILITY — returns static hex for use in Mapbox markers
// Components should use CSS variables (var(--accent-available)) instead
// ─────────────────────────────────────────────────────

export function getAvailabilityInfo(lot) {
  const pct = lot.totalSlots > 0 ? lot.availableCount / lot.totalSlots : 0;

  if (lot.availableCount === 0) {
    return {
      label: "Full",
      color: "#94A3B8",
      bg:    "rgba(148,163,184,0.12)",
      textClass: "text-slate-400",
    };
  }
  if (pct <= 0.2) {
    return {
      label: "Almost Full",
      color: "#F97316",
      bg:    "rgba(249,115,22,0.12)",
      textClass: "text-orange-400",
    };
  }
  if (pct <= 0.5) {
    return {
      label: "Filling Up",
      color: "#FBBF24",
      bg:    "rgba(251,191,36,0.12)",
      textClass: "text-amber-400",
    };
  }
  return {
    label: "Available",
    color: "#10B981",
    bg:    "rgba(16,185,129,0.12)",
    textClass: "text-emerald-500",
  };
}

// ─────────────────────────────────────────────────────
// CARD FORMATTING
// ─────────────────────────────────────────────────────

export function maskCardNumber(raw) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

export function maskExpiry(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}
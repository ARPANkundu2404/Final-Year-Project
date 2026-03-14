"use client";

/**
 * components/Map/MapComponent.jsx
 *
 * Theme-aware Mapbox GL JS:
 * ✅ Light → mapbox://styles/mapbox/navigation-day-v1
 * ✅ Dark  → mapbox://styles/mapbox/navigation-night-v1
 * ✅ Style switches immediately on theme change (no re-mount)
 * ✅ map.setStyle() used — preserves viewport, avoids flash
 * ✅ Markers and user location re-rendered after style load
 * ✅ Pearl/Midnight Jewel themed overlay UI
 */

import { useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, AlertTriangle, Loader2 } from "lucide-react";
import { useMapData } from "@/hooks/useMapData";
import { useParkingContext } from "@/context/ParkingContext";
import { getAvailabilityInfo } from "@/utils/formatters";

// ─────────────────────────────────────────────────────
// MAPBOX STYLES
// ─────────────────────────────────────────────────────

export const MAPBOX_STYLES = {
  light: "mapbox://styles/mapbox/navigation-day-v1",
  dark:  "mapbox://styles/mapbox/navigation-night-v1",
};

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────

export default function MapComponent() {
  const containerRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const { isMapReady, mapError, requestUserLocation } = useMapData(
    containerRef,
    resolvedTheme  // Pass theme so the hook can react to changes
  );

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="relative w-full h-full"
      style={{ background: "var(--loader-bg)" }}
    >
      {/* ── Mapbox canvas ── */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ visibility: mapError ? "hidden" : "visible" }}
      />

      {/* ── Overlays ── */}
      <AnimatePresence>
        {!isMapReady && !mapError && <MapLoader key="loader" />}
        {mapError && <MapFallback key="fallback" error={mapError} />}
      </AnimatePresence>

      {/* ── Location control (top-right) ── */}
      {isMapReady && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 z-10"
        >
          <button
            onClick={requestUserLocation}
            title="My location"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: "var(--surface)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <Navigation2
              className="w-4 h-4"
              style={{ color: "var(--accent-available)" }}
            />
          </button>
        </motion.div>
      )}

      {/* ── Map Legend (top-left) ── */}
      {isMapReady && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute top-4 left-4 z-10"
        >
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs"
            style={{
              background: "var(--surface)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--border)",
            }}
          >
            <LegendDot
              color="var(--accent-available)"
              glow={isDark ? "0 0 6px var(--accent-available)" : "none"}
              label="Available"
            />
            <LegendDot
              color="var(--accent-occupied)"
              label="Full"
            />
            <LegendDot
              color="var(--accent-rec)"
              label="Best"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAP LOADER — themed
// ─────────────────────────────────────────────────────

function MapLoader() {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center"
      style={{ background: "var(--loader-bg)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--accent-indigo-soft)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <span
            className="text-2xl font-black"
            style={{ color: "var(--accent-indigo)" }}
          >
            P
          </span>
        </div>
        <Loader2
          className="absolute -bottom-2 -right-2 w-5 h-5 animate-spin"
          style={{ color: "var(--accent-available)" }}
        />
      </div>

      <p
        className="text-sm font-medium mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        Loading map…
      </p>

      <div className="flex gap-1.5">
        {[0, 0.18, 0.36].map((delay) => (
          <motion.div
            key={delay}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent-available)" }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.3, delay, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
// MAP FALLBACK — when no token or load failure
// ─────────────────────────────────────────────────────

function MapFallback({ error }) {
  const { lots, selectLot, recommendedLot } = useParkingContext();

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col overflow-y-auto"
      style={{ background: "var(--loader-bg)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Error header */}
      <div
        className="px-4 pt-6 pb-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle
            className="w-4 h-4"
            style={{ color: "var(--accent-rec)" }}
          />
          <p className="text-sm font-semibold" style={{ color: "var(--accent-rec)" }}>
            {error === "no_token" ? "Map token not configured" : "Map failed to load"}
          </p>
        </div>
        <p className="text-xs pl-6" style={{ color: "var(--text-muted)" }}>
          {error === "no_token"
            ? "Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local"
            : "Check your internet connection or Mapbox token."}
        </p>
      </div>

      {/* Lot list */}
      <div className="flex-1 px-4 py-4">
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Nearby Lots
        </p>
        <div className="space-y-2">
          {lots.map((lot) => {
            const av = getAvailabilityInfo(lot);
            const isRec = lot.id === recommendedLot?.id;

            return (
              <motion.button
                key={lot.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectLot(lot)}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: av.bg }}
                >
                  <span className="text-base font-black" style={{ color: av.color }}>
                    P
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {lot.name}
                    </p>
                    {isRec && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          color: "var(--accent-rec)",
                          background: "var(--accent-rec-glow)",
                          border: "1px solid var(--accent-rec-glow)",
                        }}
                      >
                        Best
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: av.color }}>
                    {av.label} · {lot.availableCount}/{lot.totalSlots}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    ₹{lot.pricePerHour}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>/hr</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────

function LegendDot({ color, glow = "none", label }) {
  return (
    <span
      className="flex items-center gap-1.5"
      style={{ color: "var(--text-secondary)" }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ background: color, boxShadow: glow }}
      />
      {label}
    </span>
  );
}
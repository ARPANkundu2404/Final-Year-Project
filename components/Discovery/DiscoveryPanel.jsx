"use client";

/**
 * components/Discovery/DiscoveryPanel.jsx
 * Theme-aware via CSS variables — no hardcoded colors.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, MapPin, Zap, Star } from "lucide-react";
import { useParkingContext } from "@/context/ParkingContext";
import { formatDistance, getAvailabilityInfo } from "@/utils/formatters";

export default function DiscoveryPanel() {
  const { lots, recommendedLot, selectLot } = useParkingContext();
  const [expanded, setExpanded] = useState(false);

  if (!lots.length) return null;

  const sorted = [...lots].sort((a, b) => {
    if (a.id === recommendedLot?.id) return -1;
    if (b.id === recommendedLot?.id) return 1;
    if (a.availableCount === 0 && b.availableCount > 0) return 1;
    if (b.availableCount === 0 && a.availableCount > 0) return -1;
    return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
  });

  const visible = expanded ? sorted : sorted.slice(0, 2);
  const availableCount = lots.filter((l) => l.availableCount > 0).length;

  return (
    <div className="absolute z-20 bottom-20 left-3 right-3 md:bottom-5 md:left-5 md:right-auto md:w-[340px]">
      <motion.div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "var(--surface)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--sheet-shadow)",
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 22 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Nearby
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {availableCount} lot{availableCount !== 1 ? "s" : ""} available
            </p>
          </div>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-none"
            style={{
              background: "var(--accent-glow)",
              border: "1px solid var(--accent-available)",
              color: "var(--accent-available)",
            }}
          >
            {expanded ? (
              <><span>Less</span><ChevronDown className="w-3 h-3" /></>
            ) : (
              <><span>See all</span><ChevronUp className="w-3 h-3" /></>
            )}
          </button>
        </div>

        {/* Rows */}
        <AnimatePresence initial={false}>
          {visible.map((lot, i) => (
            <LotRow
              key={lot.id}
              lot={lot}
              isRecommended={lot.id === recommendedLot?.id}
              onSelect={() => selectLot(lot)}
              index={i}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function LotRow({ lot, isRecommended, onSelect, index }) {
  const av = getAvailabilityInfo(lot);

  return (
    <motion.button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-none"
      style={{ borderBottom: "1px solid var(--border)" }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative"
        style={{ background: av.bg }}
      >
        <span className="text-base font-black" style={{ color: av.color }}>P</span>
        {isRecommended && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "var(--accent-rec)" }}
          >
            <Star className="w-2.5 h-2.5" style={{ fill: "#1E1B4B", color: "#1E1B4B" }} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {lot.name}
          </p>
          {isRecommended && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
              style={{
                color: "var(--accent-rec)",
                background: "var(--accent-rec-glow)",
                border: "1px solid var(--accent-rec-glow)",
              }}
            >
              BEST
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold" style={{ color: av.color }}>
            {lot.availableCount === 0 ? "Full" : `${lot.availableCount} free`}
          </span>
          {lot.distanceKm != null && (
            <>
              <span style={{ color: "var(--border-strong)" }}>·</span>
              <span className="flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
                <MapPin className="w-2.5 h-2.5" />
                {formatDistance(lot.distanceKm)}
              </span>
            </>
          )}
          {lot.amenities.includes("EV Charging") && (
            <Zap className="w-3 h-3 ml-auto" style={{ color: "var(--accent-rec)" }} />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
          ₹{lot.pricePerHour}
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>/hr</p>
      </div>
    </motion.button>
  );
}
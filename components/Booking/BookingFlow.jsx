"use client";

/**
 * components/Booking/BookingFlow.jsx
 *
 * Theme-aware booking state machine.
 * Pearl: clean card, soft shadows, charcoal ink text
 * Midnight Jewel: glass surface, neon mint accents, glow buttons
 *
 * ✅ Spring animation on BottomSheet open
 * ✅ All colors via CSS variables
 * ✅ Framer Motion AnimatePresence between steps
 */

import { useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  X,
  MapPin,
  Star,
  Clock,
  Car,
  Lock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  Wifi,
} from "lucide-react";
import { useParkingContext, BOOKING_STEPS } from "@/context/ParkingContext";
import {
  formatINR,
  formatDistance,
  getAvailabilityInfo,
  maskCardNumber,
  maskExpiry,
} from "@/utils/formatters";

// ─────────────────────────────────────────────────────
// ORCHESTRATOR
// ─────────────────────────────────────────────────────

export default function BookingFlow() {
  const { bookingStep } = useParkingContext();

  return (
    <AnimatePresence mode="wait">
      {bookingStep === BOOKING_STEPS.BOOKING && <BottomSheet key="sheet" />}
      {bookingStep === BOOKING_STEPS.PROCESSING && <StripeModal key="stripe" />}
      {bookingStep === BOOKING_STEPS.PAID && <SuccessOverlay key="success" />}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────
// STEP 1: BOTTOM SHEET
// ─────────────────────────────────────────────────────

function BottomSheet() {
  const { activeLot, recommendedLot, clearLot, setStep } = useParkingContext();
  const [duration, setDuration] = useState(2);
  const [selectedSlotType, setSelectedSlotType] = useState("Standard");

  // Drag-to-dismiss
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [0, 160], [1, 0]);

  if (!activeLot) return null;

  const av = getAvailabilityInfo(activeLot);
  const isRec = activeLot.id === recommendedLot?.id;
  const isFull = activeLot.availableCount === 0;
  const base = activeLot.pricePerHour * duration;
  const fee = Math.round(base * 0.05);
  const total = base + fee;

  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        className="fixed inset-0 z-30 md:hidden"
        style={{ background: "rgba(0,0,0,0.35)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={clearLot}
      />

      {/* Sheet — spring entrance */}
      <motion.div
        className="fixed z-40 inset-x-0 bottom-0 md:inset-auto md:right-5 md:bottom-5 md:top-5 md:w-[380px]"
        style={{ y: dragY }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ bottom: 0.2, top: 0 }}
        onDragEnd={(_, info) => {
          if (info.velocity.y > 400 || info.offset.y > 130) clearLot();
          else dragY.set(0);
        }}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{
          type: "spring",
          damping: 26,
          stiffness: 300,
          mass: 0.9,
        }}
      >
        <motion.div
          className="flex flex-col max-h-[88vh] md:max-h-full overflow-hidden rounded-t-3xl md:rounded-3xl"
          style={{
            background: "var(--sheet-bg)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--sheet-shadow)",
            opacity,
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
            <div
              className="w-9 h-1 rounded-full"
              style={{ background: "var(--border-strong)" }}
            />
          </div>

          <div className="overflow-y-auto overscroll-contain flex-1 px-5 pt-3 pb-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {isRec && (
                    <ThemeBadge
                      text="★ Recommended"
                      color="var(--accent-rec)"
                      bg="var(--accent-rec-glow)"
                    />
                  )}
                  <ThemeBadge text={av.label} color={av.color} bg={av.bg} />
                </div>
                <h2
                  className="text-lg font-bold leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activeLot.name}
                </h2>
                <p
                  className="text-xs flex items-center gap-1 mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <MapPin className="w-3 h-3" /> {activeLot.address}
                </p>
              </div>
              <button
                onClick={clearLot}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-none shrink-0"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <SheetStatCard
                icon={<Car className="w-3.5 h-3.5" />}
                value={activeLot.availableCount}
                label="Free slots"
                color="var(--accent-available)"
              />
              <SheetStatCard
                icon={<Clock className="w-3.5 h-3.5" />}
                value={`₹${activeLot.pricePerHour}`}
                label="Per hour"
                color="var(--accent-indigo)"
              />
              <SheetStatCard
                icon={<Star className="w-3.5 h-3.5" />}
                value={activeLot.rating}
                label="Rating"
                color="var(--accent-rec)"
              />
            </div>

            {/* Distance */}
            {activeLot.distanceKm != null && (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <MapPin
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--accent-indigo)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {formatDistance(activeLot.distanceKm)} away
                </span>
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  ~{Math.max(1, Math.ceil(activeLot.distanceKm * 12))} min walk
                </span>
              </div>
            )}

            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {activeLot.amenities.map((a) => (
                <span
                  key={a}
                  className="text-[11px] px-2.5 py-1 rounded-lg"
                  style={{
                    color: "var(--accent-indigo)",
                    background: "var(--accent-indigo-soft)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>

            {/* Duration picker */}
            <div className="mb-5">
              <p
                className="text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Duration
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    onClick={() => setDuration(h)}
                    className="py-2 rounded-xl text-sm font-bold transition-none"
                    style={
                      duration === h
                        ? {
                            background: "var(--accent-available)",
                            color: "#ffffff",
                            boxShadow: "0 4px 12px var(--accent-glow)",
                          }
                        : {
                            background: "var(--surface)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div
              className="rounded-2xl p-4 mb-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <PriceRow
                label={`₹${activeLot.pricePerHour} × ${duration}h`}
                value={formatINR(base)}
              />
              <PriceRow label="Service fee (5%)" value={formatINR(fee)} />
              <div
                className="border-t pt-2 mt-2 flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Total
                </span>
                <span
                  className="font-black text-xl"
                  style={{ color: "var(--accent-available)" }}
                >
                  {formatINR(total)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={isFull}
              onClick={() => setStep(BOOKING_STEPS.PROCESSING)}
              className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-none"
              style={
                isFull
                  ? {
                      background: "var(--surface)",
                      color: "var(--text-muted)",
                      cursor: "not-allowed",
                    }
                  : {
                      background: "var(--accent-available)",
                      color: "#ffffff",
                      boxShadow: "0 6px 20px var(--accent-glow)",
                    }
              }
            >
              {isFull ? (
                "Parking Full"
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Book Now · {formatINR(total)}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// STEP 2: STRIPE MODAL
// ─────────────────────────────────────────────────────

function StripeModal() {
  const { activeLot, setStep, confirmPayment } = useParkingContext();
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amount = activeLot
    ? formatINR(Math.round(activeLot.pricePerHour * 2 * 1.05))
    : "—";

  const handlePay = useCallback(async () => {
    setError("");
    if (cardNum.replace(/\s/g, "").length < 16)
      return setError("Enter a valid 16-digit card number.");
    if (expiry.length < 5) return setError("Enter a valid expiry (MM/YY).");
    if (cvv.length < 3) return setError("Enter a valid CVV.");
    if (!name.trim()) return setError("Enter the cardholder name.");

    setSubmitting(true);

    // STRIPE_API_POINT:
    // const { clientSecret } = await fetch("/api/stripe/create-intent", {
    //   method: "POST", body: JSON.stringify({ amount: totalPaise, currency: "inr" })
    // }).then(r => r.json());
    // const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });

    await new Promise((r) => setTimeout(r, 2400));
    confirmPayment({
      duration: 2,
      cardLast4: cardNum.replace(/\s/g, "").slice(-4),
    });
  }, [cardNum, expiry, cvv, name, confirmPayment]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        onClick={() => !submitting && setStep(BOOKING_STEPS.BOOKING)}
      />

      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-t-3xl md:rounded-3xl z-10"
        style={{
          background: "var(--sheet-bg)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--sheet-shadow)",
        }}
        initial={{ y: 60, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        {/* Processing overlay */}
        <AnimatePresence>
          {submitting && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
              style={{ background: "var(--sheet-bg)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative w-16 h-16">
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="var(--accent-available)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="176"
                    initial={{ strokeDashoffset: 176 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2.4, ease: "easeInOut" }}
                  />
                </svg>
                <Lock
                  className="absolute inset-0 m-auto w-6 h-6"
                  style={{ color: "var(--accent-available)" }}
                />
              </div>
              <div className="text-center">
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Processing…
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Secured by Stripe
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Secure Checkout
              </h2>
              <p
                className="text-xs flex items-center gap-1 mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Lock
                  className="w-3 h-3"
                  style={{ color: "var(--accent-available)" }}
                />
                256-bit TLS encrypted
              </p>
            </div>
            {!submitting && (
              <button
                onClick={() => setStep(BOOKING_STEPS.BOOKING)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lot summary */}
          <div
            className="flex items-center gap-3 rounded-2xl px-3 py-3 mb-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-glow)" }}
            >
              <Car
                className="w-5 h-5"
                style={{ color: "var(--accent-available)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {activeLot?.name}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {activeLot?.address}
              </p>
            </div>
            <p
              className="font-black text-base shrink-0"
              style={{ color: "var(--accent-available)" }}
            >
              {amount}
            </p>
          </div>

          {/* Card fields */}
          <div className="space-y-3 mb-4">
            <CardField
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNum}
              onChange={(e) => setCardNum(maskCardNumber(e.target.value))}
              inputMode="numeric"
              rightIcon={
                <CreditCard
                  className="w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <CardField
                label="Expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(maskExpiry(e.target.value))}
                inputMode="numeric"
              />
              <CardField
                label="CVV"
                placeholder="•••"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                type="password"
                inputMode="numeric"
              />
            </div>
            <CardField
              label="Cardholder Name"
              placeholder="Full name on card"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
                style={{
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <p className="text-sm text-rose-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pay button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePay}
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-none disabled:opacity-50"
            style={{
              background: "var(--accent-available)",
              color: "#ffffff",
              boxShadow: "0 6px 20px var(--accent-glow)",
            }}
          >
            <Lock className="w-4 h-4" />
            Pay {amount}
          </motion.button>

          {/* Trust row */}
          <div className="flex justify-center gap-5 mt-4">
            {[
              { icon: Shield, text: "Secure" },
              { icon: Wifi, text: "Encrypted" },
              { icon: Zap, text: "Instant" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                <Icon className="w-3 h-3" /> {text}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
// STEP 3: SUCCESS OVERLAY
// ─────────────────────────────────────────────────────

function SuccessOverlay() {
  const { setStep } = useParkingContext();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Checkmark */}
        <div className="relative mb-7">
          {[1.8, 2.4, 3.0].map((scale, i) => (
            <motion.div
              key={scale}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--accent-available)" }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: 0.25 + i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}

          <motion.div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent-available)",
              boxShadow: "0 0 40px var(--accent-glow)",
            }}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              damping: 14,
              stiffness: 350,
              delay: 0.1,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CheckCircle2
                className="w-12 h-12 text-white"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>
        </div>

        <motion.h2
          className="text-2xl font-black mb-2"
          style={{ color: "var(--text-primary)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Booking Confirmed!
        </motion.h2>

        <motion.p
          className="text-sm mb-8 max-w-xs"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Your parking spot is reserved. View your digital ticket below.
        </motion.p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep(BOOKING_STEPS.TICKET)}
          className="px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-none"
          style={{
            background: "var(--accent-available)",
            color: "#ffffff",
            boxShadow: "0 6px 20px var(--accent-glow)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          View My Ticket <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────

function SheetStatCard({ icon, value, label, color }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl py-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span
        className="text-base font-black"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm mb-2">
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function ThemeBadge({ text, color, bg }) {
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color, background: bg, border: `1px solid ${color}40` }}
    >
      {text}
    </span>
  );
}

function CardField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode,
  rightIcon,
}) {
  return (
    <div>
      <label
        className="text-[11px] font-bold uppercase tracking-wide block mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            paddingRight: rightIcon ? "2.5rem" : undefined,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent-available)";
            e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
}

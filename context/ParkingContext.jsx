"use client";

/**
 * context/ParkingContext.jsx
 *
 * ✅ No Web3 / MetaMask / blockchain
 * ✅ Clean booking state machine
 * ✅ Theme-agnostic — availability colors live in utils/formatters.js
 *    and adapt via CSS variables in components
 * ✅ FIREBASE_INTEGRATION_POINTs clearly marked
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { generateBookingId, calculateDistance } from "@/utils/formatters";

// ─────────────────────────────────────────────────────
// BOOKING STATE MACHINE
// ─────────────────────────────────────────────────────

export const BOOKING_STEPS = {
  BROWSING:   "browsing",    // Map visible, no lot selected
  BOOKING:    "booking",     // Bottom sheet open
  PROCESSING: "processing",  // Payment modal → spinner
  PAID:       "paid",        // Success animation
  TICKET:     "ticket",      // QR ticket view
};

// ─────────────────────────────────────────────────────
// ACTION TYPES
// ─────────────────────────────────────────────────────

export const ACTIONS = {
  SET_USER_LOCATION:  "SET_USER_LOCATION",
  SET_LOTS:           "SET_LOTS",
  UPDATE_LOT:         "UPDATE_LOT",
  SELECT_LOT:         "SELECT_LOT",
  CLEAR_LOT:          "CLEAR_LOT",
  SET_STEP:           "SET_STEP",
  SET_BOOKING_DETAILS:"SET_BOOKING_DETAILS",
  RESET_BOOKING:      "RESET_BOOKING",
  SET_NAV_TAB:        "SET_NAV_TAB",
  SET_PANEL_EXPANDED: "SET_PANEL_EXPANDED",
  SET_NOTIFICATION:   "SET_NOTIFICATION",
  CLEAR_NOTIFICATION: "CLEAR_NOTIFICATION",
};

// ─────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────

const INITIAL_STATE = {
  userLocation:   null,
  lots:           [],
  activeLot:      null,
  bookingStep:    BOOKING_STEPS.BROWSING,
  bookingDetails: null,
  activeNavTab:   "home",
  isPanelExpanded: false,
  notification:   null,
};

// ─────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER_LOCATION:
      return { ...state, userLocation: action.payload };

    case ACTIONS.SET_LOTS:
      return { ...state, lots: action.payload };

    case ACTIONS.UPDATE_LOT:
      // FIREBASE_INTEGRATION_POINT: Triggered by onSnapshot ESP32 sensor changes
      return {
        ...state,
        lots: state.lots.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload } : l
        ),
        activeLot:
          state.activeLot?.id === action.payload.id
            ? { ...state.activeLot, ...action.payload }
            : state.activeLot,
      };

    case ACTIONS.SELECT_LOT:
      return {
        ...state,
        activeLot:   action.payload,
        bookingStep: BOOKING_STEPS.BOOKING,
      };

    case ACTIONS.CLEAR_LOT:
      return {
        ...state,
        activeLot:   null,
        bookingStep: BOOKING_STEPS.BROWSING,
      };

    case ACTIONS.SET_STEP:
      return { ...state, bookingStep: action.payload };

    case ACTIONS.SET_BOOKING_DETAILS:
      return { ...state, bookingDetails: action.payload };

    case ACTIONS.RESET_BOOKING:
      return {
        ...state,
        activeLot:      null,
        bookingStep:    BOOKING_STEPS.BROWSING,
        bookingDetails: null,
      };

    case ACTIONS.SET_NAV_TAB:
      return { ...state, activeNavTab: action.payload };

    case ACTIONS.SET_PANEL_EXPANDED:
      return { ...state, isPanelExpanded: action.payload };

    case ACTIONS.SET_NOTIFICATION:
      return { ...state, notification: action.payload };

    case ACTIONS.CLEAR_NOTIFICATION:
      return { ...state, notification: null };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────
// CONTEXT + PROVIDER
// ─────────────────────────────────────────────────────

const ParkingContext = createContext(null);

export function ParkingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Derived: nearest available lot
  const recommendedLot = useMemo(() => {
    if (!state.userLocation || !state.lots.length) return null;
    const available = state.lots.filter((l) => l.availableCount > 0);
    if (!available.length) return null;
    return available.reduce((best, lot) => {
      const d    = calculateDistance(state.userLocation.lat, state.userLocation.lng, lot.coordinates.lat, lot.coordinates.lng);
      const bestD = calculateDistance(state.userLocation.lat, state.userLocation.lng, best.coordinates.lat, best.coordinates.lng);
      return d < bestD ? lot : best;
    });
  }, [state.userLocation, state.lots]);

  // Action helpers
  const selectLot = useCallback(
    (lot) => dispatch({ type: ACTIONS.SELECT_LOT, payload: lot }), []
  );

  const clearLot = useCallback(
    () => dispatch({ type: ACTIONS.CLEAR_LOT }), []
  );

  const setStep = useCallback(
    (step) => dispatch({ type: ACTIONS.SET_STEP, payload: step }), []
  );

  const confirmPayment = useCallback(
    ({ duration, cardLast4 }) => {
      if (!state.activeLot) return;
      const baseAmount  = state.activeLot.pricePerHour * duration;
      const serviceFee  = Math.round(baseAmount * 0.05);
      const totalAmount = baseAmount + serviceFee;

      const details = {
        lot:       state.activeLot,
        duration,
        slotLabel: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 30) + 1}`,
        totalAmount,
        bookingId:  generateBookingId(),
        timestamp:  Date.now(),
        cardLast4,
      };

      // FIREBASE_INTEGRATION_POINT: Persist booking to Firestore
      // await addDoc(collection(db, "bookings"), { ...details, userId: auth.currentUser.uid });

      dispatch({ type: ACTIONS.SET_BOOKING_DETAILS, payload: details });
      dispatch({ type: ACTIONS.SET_STEP, payload: BOOKING_STEPS.PAID });
    },
    [state.activeLot]
  );

  const resetBooking = useCallback(
    () => dispatch({ type: ACTIONS.RESET_BOOKING }), []
  );

  const notify = useCallback(
    (message, type = "info") =>
      dispatch({ type: ACTIONS.SET_NOTIFICATION, payload: { message, type } }),
    []
  );

  const value = useMemo(() => ({
    ...state,
    recommendedLot,
    dispatch,
    selectLot,
    clearLot,
    setStep,
    confirmPayment,
    resetBooking,
    notify,
    clearNotification: () => dispatch({ type: ACTIONS.CLEAR_NOTIFICATION }),
  }), [state, recommendedLot, selectLot, clearLot, setStep, confirmPayment, resetBooking, notify]);

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParkingContext() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParkingContext must be inside <ParkingProvider>");
  return ctx;
}
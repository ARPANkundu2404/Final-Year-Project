"use client";

/**
 * hooks/useFirebaseSim.js
 * Simulates Firestore real-time updates.
 * FIREBASE_INTEGRATION_POINTs clearly marked.
 */

import { useEffect, useRef, useCallback } from "react";
import { useParkingContext } from "@/context/ParkingContext";
import { ACTIONS } from "@/context/ParkingContext";
import { calculateDistance } from "@/utils/formatters";
import { MOCK_LOTS } from "@/utils/mockData";

export function useFirebaseSim() {
  const { userLocation, dispatch } = useParkingContext();
  const intervalRef = useRef(null);
  const mountedRef  = useRef(true);

  const loadLots = useCallback(async () => {
    // FIREBASE_INTEGRATION_POINT:
    // const snapshot = await getDocs(collection(db, "parkingLots"));
    // const lots = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    await new Promise((r) => setTimeout(r, 600));
    if (!mountedRef.current) return;

    const enriched = MOCK_LOTS.map((lot) => ({
      ...lot,
      distanceKm: userLocation
        ? calculateDistance(
            userLocation.lat, userLocation.lng,
            lot.coordinates.lat, lot.coordinates.lng
          )
        : null,
    }));

    dispatch({ type: ACTIONS.SET_LOTS, payload: enriched });
  }, [dispatch, userLocation]);

  const startListeners = useCallback(() => {
    // FIREBASE_INTEGRATION_POINT:
    // const unsub = onSnapshot(collection(db, "sensorData"), snap => {
    //   snap.docChanges().forEach(change => {
    //     if (change.type === "modified") {
    //       dispatch({ type: ACTIONS.UPDATE_LOT, payload: change.doc.data() });
    //     }
    //   });
    // });
    // return unsub;

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      const lot = MOCK_LOTS[Math.floor(Math.random() * MOCK_LOTS.length)];
      const delta = Math.random() > 0.5 ? 1 : -1;
      lot.availableCount = Math.max(0, Math.min(lot.totalSlots, lot.availableCount + delta));
      dispatch({
        type: ACTIONS.UPDATE_LOT,
        payload: { id: lot.id, availableCount: lot.availableCount },
      });
    }, 6000);
  }, [dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    loadLots();
    startListeners();
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadLots, startListeners]);
}
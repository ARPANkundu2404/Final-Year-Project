"use client";

/**
 * hooks/useMapData.js
 *
 * Theme integration:
 * ✅ Accepts `resolvedTheme` as a parameter
 * ✅ Uses map.setStyle() (NOT re-mount) to switch day/night style
 *    → Preserves viewport, camera, pitch → no jarring jump
 * ✅ Re-renders markers + user location after style swap
 *    (required because setStyle() removes all custom layers)
 * ✅ No Web3 / MetaMask
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useParkingContext } from "@/context/ParkingContext";
import { ACTIONS } from "@/context/ParkingContext";
import { createMarkerElement, createUserLocationMarker } from "@/utils/mapHelpers";
import { MAPBOX_STYLES } from "@/components/Map/MapComponent";

export function useMapData(containerRef, resolvedTheme) {
  const { lots, activeLot, recommendedLot, userLocation, dispatch, selectLot } =
    useParkingContext();

  const mapRef          = useRef(null);
  const markersRef      = useRef({});     // lotId → Marker
  const userMarkerRef   = useRef(null);
  const mapboxglRef     = useRef(null);   // cached module ref
  const isStyleReady    = useRef(false);  // track style load state

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError,   setMapError]   = useState(null);

  // ── Render all lot markers ────────────────────────────────────────────────
  const renderMarkers = useCallback(() => {
    const mapboxgl = mapboxglRef.current;
    const map = mapRef.current;
    if (!mapboxgl || !map || !lots.length) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    lots.forEach((lot) => {
      const el = createMarkerElement({
        isAvailable:    lot.availableCount > 0,
        isRecommended:  lot.id === recommendedLot?.id,
        isSelected:     lot.id === activeLot?.id,
        count:          lot.availableCount,
        isDark:         resolvedTheme === "dark",
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectLot(lot);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lot.coordinates.lng, lot.coordinates.lat])
        .addTo(map);

      markersRef.current[lot.id] = marker;
    });
  }, [lots, activeLot, recommendedLot, selectLot, resolvedTheme]);

  // ── Render user location marker ───────────────────────────────────────────
  const renderUserMarker = useCallback(() => {
    const mapboxgl = mapboxglRef.current;
    const map = mapRef.current;
    if (!mapboxgl || !map || !userLocation) return;

    userMarkerRef.current?.remove();
    userMarkerRef.current = new mapboxgl.Marker({
      element: createUserLocationMarker({ isDark: resolvedTheme === "dark" }),
      anchor:  "center",
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);
  }, [userLocation, resolvedTheme]);

  // ── Initialize Mapbox ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!TOKEN || TOKEN === "YOUR_MAPBOX_TOKEN") {
      setMapError("no_token");
      return;
    }

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!containerRef.current) return;

      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = TOKEN;

      const initialStyle =
        resolvedTheme === "light"
          ? MAPBOX_STYLES.light
          : MAPBOX_STYLES.dark;

      const map = new mapboxgl.Map({
        container:          containerRef.current,
        style:              initialStyle,
        center:             [77.6072, 12.9757],
        zoom:               12,
        pitch:              25,
        antialias:          true,
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-left"
      );
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "bottom-right"
      );

      map.on("load", () => {
        mapRef.current  = map;
        isStyleReady.current = true;
        setIsMapReady(true);
      });

      map.on("style.load", () => {
        // Re-render markers after any style change (setStyle removes them)
        isStyleReady.current = true;
        renderMarkers();
        renderUserMarker();
      });

      map.on("error", (e) => {
        if (e?.error?.status === 404) return; // Ignore tile 404s
        console.error("[Map]", e.error?.message);
        setMapError("load_failed");
      });
    }).catch(() => setMapError("import_failed"));

    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      userMarkerRef.current?.remove();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapboxglRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]); // Only init once

  // ── Switch Mapbox style when theme changes ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !resolvedTheme) return;

    const nextStyle =
      resolvedTheme === "light" ? MAPBOX_STYLES.light : MAPBOX_STYLES.dark;

    const currentStyle = mapRef.current.getStyle()?.name;

    // Avoid redundant style switches
    const isAlreadyDay  = currentStyle?.toLowerCase().includes("day");
    const isAlreadyNight = currentStyle?.toLowerCase().includes("night");
    if (resolvedTheme === "light" && isAlreadyDay) return;
    if (resolvedTheme === "dark"  && isAlreadyNight) return;

    isStyleReady.current = false;

    // setStyle preserves viewport/camera, only swaps the visual style
    mapRef.current.setStyle(nextStyle);

    // Markers will be re-rendered by the style.load listener above
  }, [resolvedTheme]);

  // ── Re-render markers when lot data or selection changes ──────────────────
  useEffect(() => {
    if (!isMapReady) return;
    renderMarkers();
  }, [isMapReady, renderMarkers]);

  // ── Re-render user location marker ───────────────────────────────────────
  useEffect(() => {
    if (!isMapReady) return;
    renderUserMarker();
  }, [isMapReady, renderUserMarker]);

  // ── Fly to active lot ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !activeLot) return;
    mapRef.current.flyTo({
      center:   [activeLot.coordinates.lng, activeLot.coordinates.lat - 0.004],
      zoom:     15,
      duration: 1000,
      essential: true,
    });
  }, [activeLot]);

  // ── Geolocation ───────────────────────────────────────────────────────────
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        dispatch({ type: ACTIONS.SET_USER_LOCATION, payload: loc });
        mapRef.current?.flyTo({
          center:   [loc.lng, loc.lat],
          zoom:     14,
          duration: 1800,
        });
      },
      (err) => console.warn("[Geolocation]", err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [dispatch]);

  // Request geolocation on mount
  useEffect(() => {
    requestUserLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isMapReady, mapError, requestUserLocation };
}
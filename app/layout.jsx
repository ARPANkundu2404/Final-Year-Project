/**
 * app/layout.jsx
 *
 * ZERO-FLICKER STRATEGY:
 * next-themes uses suppressHydrationWarning + injects a
 * blocking <script> that sets class="dark" on <html> BEFORE
 * the browser paints. This eliminates theme flicker completely.
 *
 * The ThemeProvider is server-side but its children are client.
 * We use attribute="class" (not data-theme) because Tailwind's
 * darkMode:"class" watches the <html class="dark"> flag.
 */

import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "SmartPark — Intelligent Parking",
  description: "Find, book, and navigate to parking in real time.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)",  color: "#0F172A" },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    /*
     * suppressHydrationWarning is REQUIRED here.
     * next-themes modifies <html class> via a blocking script
     * before React hydrates — React would otherwise warn about
     * a class mismatch between server and client renders.
     */
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Mapbox GL CSS — must be loaded before map init or tiles won't show */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css"
          rel="stylesheet"
        />

        {/* Outfit + JetBrains Mono — the 2026 aesthetic typeface pairing */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        {/*
         * ThemeProvider config:
         * - attribute="class"      → sets/removes "dark" class on <html>
         * - defaultTheme="dark"    → first load defaults to Midnight Jewel
         * - enableSystem           → respects OS preference on first visit
         * - disableTransitionOnChange={false} → we handle the 300ms transition
         *   ourselves in globals.css (* { transition: ... })
         */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
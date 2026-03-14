"use client";

/**
 * components/Navigation/Navigation.jsx
 *
 * ✅ Mobile: Fixed bottom bar with pearl/midnight Jewel theming
 * ✅ Desktop: Fixed left side rail (72px)
 * ✅ ThemeToggle: Sun/Moon with animated swap (Framer Motion)
 * ✅ Dark mode: subtle indigo top-border glow on bottom nav
 * ✅ Light mode: clean pearl glass surface with shadow
 * ✅ All colors via CSS variables → instant theme response
 * ✅ Framer Motion layoutId for smooth active indicator
 */

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Home, BookOpen, Grid2X2, User, Sun, Moon, Sparkles } from "lucide-react";
import { useParkingContext } from "@/context/ParkingContext";
import { ACTIONS } from "@/context/ParkingContext";

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home",     label: "Home",     Icon: Home },
  { id: "bookings", label: "Bookings", Icon: BookOpen },
  { id: "services", label: "Services", Icon: Grid2X2 },
  { id: "profile",  label: "Profile",  Icon: User },
];

// ─────────────────────────────────────────────────────
// THEME TOGGLE BUTTON
// ─────────────────────────────────────────────────────

export function ThemeToggle({ compact = false }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.90 }}
      className="theme-toggle relative"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Pearl Mode" : "Midnight Jewel Mode"}
    >
      {/* Animated icon swap */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="w-4 h-4" style={{ color: "var(--accent-rec)" }} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────
// MOBILE BOTTOM NAV
// ─────────────────────────────────────────────────────

export function BottomNav() {
  const { activeNavTab, dispatch } = useParkingContext();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/*
        Dark mode: top border glow in indigo
        Light mode: clean pearl glass with drop shadow
      */}
      <div
        className="relative"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: "var(--nav-glow)",
        }}
      >
        {/* Top border — changes color with theme */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "var(--nav-border)" }}
        />

        {/* Dark mode: subtle indigo glow line */}
        <div
          className="absolute top-0 inset-x-0 h-px dark:opacity-100 opacity-0 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(99,102,241,0.5) 30%, rgba(129,140,248,0.7) 50%, rgba(99,102,241,0.5) 70%, transparent)",
          }}
        />

        <div className="flex items-center justify-around px-1 py-1.5">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeNavTab === id;
            return (
              <NavItem
                key={id}
                id={id}
                label={label}
                Icon={Icon}
                active={active}
                layoutId="bottom-nav-pill"
                onClick={() => dispatch({ type: ACTIONS.SET_NAV_TAB, payload: id })}
              />
            );
          })}

          {/* Theme toggle in bottom nav */}
          <div className="flex flex-col items-center gap-0.5 px-3 py-2">
            <ThemeToggle />
            <span className="text-[9px] font-semibold" style={{ color: "var(--text-muted)" }}>
              Theme
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────
// DESKTOP SIDE RAIL
// ─────────────────────────────────────────────────────

export function SideRail() {
  const { activeNavTab, dispatch } = useParkingContext();

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-20 w-[72px] flex-col items-center py-5"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        boxShadow: "var(--nav-glow)",
      }}
    >
      {/* Right border */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{ background: "var(--nav-border)" }}
      />

      {/* Dark mode: subtle indigo right-border glow */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px dark:opacity-100 opacity-0 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(99,102,241,0.5) 30%, rgba(129,140,248,0.7) 50%, rgba(99,102,241,0.5) 70%, transparent)",
        }}
      />

      {/* Logo mark */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-7 relative overflow-hidden"
        style={{
          background: "var(--accent-indigo-soft)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <span className="text-base font-black" style={{ color: "var(--accent-indigo)" }}>
          P
        </span>
        {/* Sparkle in dark mode */}
        <Sparkles
          className="absolute top-0.5 right-0.5 w-2.5 h-2.5 opacity-0 dark:opacity-60 transition-opacity duration-300"
          style={{ color: "var(--accent-available)" }}
        />
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1.5 flex-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeNavTab === id;
          return (
            <NavItem
              key={id}
              id={id}
              label={label}
              Icon={Icon}
              active={active}
              layoutId="side-nav-pill"
              vertical
              onClick={() => dispatch({ type: ACTIONS.SET_NAV_TAB, payload: id })}
            />
          );
        })}
      </div>

      {/* Theme toggle */}
      <div className="mb-3">
        <ThemeToggle />
      </div>

      {/* User avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <User className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────
// NAV ITEM — shared between bottom + side
// ─────────────────────────────────────────────────────

function NavItem({ id, label, Icon, active, layoutId, vertical = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 rounded-2xl ${
        vertical
          ? "flex-col w-14 py-3"
          : "flex-col px-4 py-2 min-w-[52px]"
      }`}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {/* Animated active background */}
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-2xl"
          style={{ background: "var(--accent-indigo-soft)" }}
          transition={{ type: "spring", damping: 28, stiffness: 380 }}
        />
      )}

      {/* Vertical rail: active left accent bar */}
      {active && vertical && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
          style={{ background: "var(--accent-available)" }}
        />
      )}

      {/* Bottom nav: active top dot */}
      {active && !vertical && (
        <span
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: "var(--accent-available)" }}
        />
      )}

      <Icon
        className="w-5 h-5 relative z-10 transition-none"
        style={{
          color: active ? "var(--accent-available)" : "var(--text-muted)",
          strokeWidth: active ? 2.5 : 1.8,
        }}
      />
      <span
        className="text-[9px] font-semibold relative z-10 transition-none"
        style={{ color: active ? "var(--accent-available)" : "var(--text-muted)" }}
      >
        {label}
      </span>
    </button>
  );
}
/**
 * utils/mapHelpers.js
 *
 * Theme-aware Mapbox marker DOM elements.
 * Passes isDark flag to render the correct palette:
 * - Light/Pearl:         Vibrant Emerald #10B981, soft glow
 * - Dark/Midnight Jewel: Neon Mint #2DD4BF, intense glow
 */

/**
 * @param {{ isAvailable: boolean, isRecommended: boolean, isSelected: boolean, count: number, isDark: boolean }} opts
 */
export function createMarkerElement({
  isAvailable,
  isRecommended,
  isSelected,
  count,
  isDark = true,
}) {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("aria-label", isAvailable ? `${count} slots available` : "Full");
  wrapper.style.cssText = "cursor:pointer;position:relative;user-select:none;";

  // Theme-aware colors
  const fillColor = isAvailable
    ? (isDark ? "#2DD4BF" : "#10B981")
    : (isDark ? "#475569" : "#94A3B8");

  const glowColor = isAvailable
    ? (isDark ? "rgba(45,212,191,0.4)" : "rgba(16,185,129,0.25)")
    : (isDark ? "rgba(71,85,105,0.2)"  : "rgba(148,163,184,0.15)");

  const borderColor = isSelected
    ? (isDark ? "rgba(255,255,255,0.9)" : "rgba(30,27,75,0.8)")
    : isRecommended
    ? "#FBBF24"
    : isDark
    ? "rgba(255,255,255,0.2)"
    : "rgba(30,27,75,0.15)";

  const textColor = isDark ? "#ffffff" : (isAvailable ? "#ffffff" : "#64748B");
  const labelColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.85)";

  const shadow = isSelected
    ? `0 0 0 3px ${isDark ? "rgba(255,255,255,0.25)" : "rgba(30,27,75,0.2)"}, 0 6px 20px ${glowColor}`
    : `0 4px 16px ${glowColor}`;

  const scale = isSelected ? 1.3 : isRecommended ? 1.12 : 1.0;

  wrapper.innerHTML = `
    <div style="
      transform:scale(${scale});
      transform-origin:bottom center;
      transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      display:flex;
      flex-direction:column;
      align-items:center;
    ">
      ${isRecommended ? `
        <div style="
          background:#FBBF24;
          color:#1E1B4B;
          font-size:8px;
          font-weight:800;
          padding:2px 8px;
          border-radius:99px;
          margin-bottom:3px;
          letter-spacing:0.08em;
          white-space:nowrap;
          box-shadow:0 2px 8px rgba(251,191,36,0.4);
        ">★ BEST</div>
      ` : ""}

      <div style="
        background:${fillColor};
        border:2px solid ${borderColor};
        border-radius:12px;
        padding:5px 11px;
        min-width:52px;
        text-align:center;
        box-shadow:${shadow};
      ">
        <div style="
          font-size:9px;
          font-weight:900;
          color:${labelColor};
          letter-spacing:0.15em;
          line-height:1;
          margin-bottom:1px;
        ">P</div>
        <div style="
          font-size:13px;
          font-weight:800;
          color:${textColor};
          line-height:1.1;
        ">${isAvailable ? count : "—"}</div>
        <div style="
          font-size:8px;
          color:${labelColor};
          font-weight:600;
          margin-top:1px;
        ">${isAvailable ? "free" : "full"}</div>
      </div>

      <div style="
        width:2px;
        height:7px;
        background:${fillColor};
        opacity:0.75;
      "></div>
      <div style="
        width:5px;
        height:5px;
        border-radius:50%;
        background:${fillColor};
        opacity:0.75;
      "></div>
    </div>
  `;

  return wrapper;
}

/**
 * User location pulse marker — theme-aware
 * @param {{ isDark: boolean }} opts
 */
export function createUserLocationMarker({ isDark = true } = {}) {
  const color = isDark ? "#2DD4BF" : "#10B981";
  const pulseColor = isDark
    ? "rgba(45,212,191,0.35)"
    : "rgba(16,185,129,0.30)";

  const el = document.createElement("div");
  el.style.cssText = "position:relative;width:20px;height:20px;";
  el.innerHTML = `
    <style>
      @keyframes sp-user-pulse-${isDark ? "d" : "l"} {
        0%,100% { transform:scale(1); opacity:0.7; }
        50%      { transform:scale(2.2); opacity:0; }
      }
    </style>
    <div style="
      position:absolute;inset:0;border-radius:50%;
      background:${pulseColor};
      animation:sp-user-pulse-${isDark ? "d" : "l"} 2.4s ease-in-out infinite;
    "></div>
    <div style="
      position:absolute;inset:3px;border-radius:50%;
      background:${color};
      border:2.5px solid white;
      box-shadow:0 2px 10px ${pulseColor};
    "></div>
  `;
  return el;
}
// ============================================================================
// PINTEREST-GRADE 3D-SHADED KAWAII SVG ICON & ILLUSTRATION LIBRARY
// Zero raw OS keycap/photo emojis — cohesive glossy 3D clay/toy vector art
// ============================================================================

export const UI_SVGS = {
  // --------------------------------------------------------------------------
  // 1. 5 CORE RESOURCE & STAT 3D GLOSSY ICONS
  // --------------------------------------------------------------------------
  sun: `<svg viewBox="0 0 48 48" class="svg-ico"><defs>
    <radialGradient id="gSun" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#fff9db"/>
      <stop offset="45%" stop-color="#ffd43b"/>
      <stop offset="100%" stop-color="#f08c00"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="20" fill="#ffe066" opacity="0.45"/>
  <circle cx="24" cy="24" r="16" fill="url(#gSun)" stroke="#5c3d2e" stroke-width="3"/>
  <ellipse cx="18" cy="16" rx="6" ry="3.2" transform="rotate(-28 18 16)" fill="#ffffff" opacity="0.85"/>
  <circle cx="29" cy="30" r="2" fill="#fff3bf" opacity="0.6"/>
  </svg>`,

  wood: `<svg viewBox="0 0 48 48" class="svg-ico"><defs>
    <linearGradient id="gBark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d9822b"/>
      <stop offset="55%" stop-color="#a65a1a"/>
      <stop offset="100%" stop-color="#753b09"/>
    </linearGradient>
    <linearGradient id="gCut" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff3d1"/>
      <stop offset="100%" stop-color="#e8c382"/>
    </linearGradient>
  </defs>
  <g transform="rotate(-14 24 25)">
    <rect x="8" y="14" width="28" height="20" rx="9" fill="url(#gBark)" stroke="#4a2c11" stroke-width="3"/>
    <ellipse cx="13" cy="24" rx="6.5" ry="10" fill="url(#gCut)" stroke="#4a2c11" stroke-width="2.8"/>
    <ellipse cx="13" cy="24" rx="3" ry="5" fill="none" stroke="#b0753b" stroke-width="1.8"/>
    <path d="M20 18 H32" stroke="#f4a261" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
    <path d="M27 13 C28 6, 36 6, 35 13 C32 15, 28 15, 27 13 Z" fill="#69db7c" stroke="#2b8a3e" stroke-width="2.2"/>
  </g></svg>`,

  stone: `<svg viewBox="0 0 48 48" class="svg-ico"><defs>
    <linearGradient id="gRockTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#dee2e6"/>
      <stop offset="100%" stop-color="#868e96"/>
    </linearGradient>
    <linearGradient id="gRockSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#adb5bd"/>
      <stop offset="100%" stop-color="#495057"/>
    </linearGradient>
  </defs>
  <polygon points="16,9 34,11 41,25 35,38 13,38 7,24" fill="url(#gRockSide)" stroke="#343a40" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="16,9 34,11 29,24 14,22" fill="url(#gRockTop)"/>
  <polygon points="14,22 29,24 35,38 13,38 7,24" fill="#868e96" opacity="0.65"/>
  <polyline points="7,24 14,22 29,24 41,25" fill="none" stroke="#f8f9fa" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <polyline points="29,24 35,38" fill="none" stroke="#343a40" stroke-width="2.2" opacity="0.55"/>
  </svg>`,

  crystal: `<svg viewBox="0 0 48 48" class="svg-ico"><defs>
    <linearGradient id="gGem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3d9fa"/>
      <stop offset="45%" stop-color="#da77f2"/>
      <stop offset="100%" stop-color="#862e9c"/>
    </linearGradient>
  </defs>
  <polygon points="24,5 39,19 24,43 9,19" fill="url(#gGem)" stroke="#4a154b" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="24,5 39,19 24,23" fill="#e599f7" opacity="0.85"/>
  <polygon points="24,5 24,23 9,19" fill="#f8f0fc" opacity="0.9"/>
  <polygon points="9,19 24,23 24,43" fill="#be4bdb" opacity="0.75"/>
  <circle cx="19" cy="14" r="2.2" fill="#ffffff"/>
  <path d="M38 9 L40 12 L43 13 L40 14 L38 17 L36 14 L33 13 L36 12 Z" fill="#fff3bf"/>
  </svg>`,

  heart: `<svg viewBox="0 0 48 48" class="svg-ico"><defs>
    <radialGradient id="gHeart" cx="35%" cy="28%" r="70%">
      <stop offset="0%" stop-color="#ffccd5"/>
      <stop offset="45%" stop-color="#ff4d6d"/>
      <stop offset="100%" stop-color="#c9184a"/>
    </radialGradient>
  </defs>
  <path d="M24 41 C24 41 7 30 7 17 C7 10.5 12.2 6.5 17.5 6.5 C21 6.5 23.2 8.5 24 10.8 C24.8 8.5 27 6.5 30.5 6.5 C35.8 6.5 41 10.5 41 17 C41 30 24 41 24 41 Z" fill="url(#gHeart)" stroke="#590d22" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="16" cy="14.5" rx="4.5" ry="2.6" transform="rotate(-30 16 14.5)" fill="#ffffff" opacity="0.85"/>
  </svg>`,

  // --------------------------------------------------------------------------
  // 2. SCULPTED 3D CRESCENT MOON SHRINE & FORGE ICONS
  // --------------------------------------------------------------------------
  crescentShrine: `<svg viewBox="0 0 64 64" class="svg-crescent"><defs>
    <radialGradient id="gCres" cx="30%" cy="25%" r="75%">
      <stop offset="0%" stop-color="#fff9db"/>
      <stop offset="50%" stop-color="#ffd43b"/>
      <stop offset="100%" stop-color="#e67700"/>
    </radialGradient>
  </defs>
  <path d="M42 10 C25 11 12 24 12 40 C12 52 22 58 35 56 C23 51 20 38 25 26 C29 17 36 13 42 10 Z" transform="scale(1.15) translate(-4,-5)" fill="url(#gCres)" stroke="#5c3d2e" stroke-width="3.2" stroke-linejoin="round"/>
  <ellipse cx="22" cy="24" rx="4.5" ry="2.2" transform="rotate(-48 22 24)" fill="#ffffff" opacity="0.85"/>
  <circle cx="24" cy="36" r="2.6" fill="#ff8787" opacity="0.65"/>
  <path d="M46 14 L48 19 L53 21 L48 23 L46 28 L44 23 L39 21 L44 19 Z" fill="#fff9db" stroke="#f08c00" stroke-width="1.5"/>
  </svg>`,

  forgeMoon: `<svg viewBox="0 0 56 40" class="svg-forge"><defs>
    <linearGradient id="gForgeOrb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff9db"/>
      <stop offset="55%" stop-color="#ffd43b"/>
      <stop offset="100%" stop-color="#f08c00"/>
    </linearGradient>
  </defs>
  <polygon points="12,8 20,16 12,28 4,16" fill="#da77f2" stroke="#4a154b" stroke-width="2.2"/>
  <path d="M23 19 H31 M28 15 L33 19 L28 23" fill="none" stroke="#5c3d2e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="43" cy="19" r="10" fill="url(#gForgeOrb)" stroke="#5c3d2e" stroke-width="2.5"/>
  <ellipse cx="40" cy="15" rx="3.5" ry="1.8" transform="rotate(-25 40 15)" fill="#ffffff" opacity="0.85"/>
  </svg>`,

  // --------------------------------------------------------------------------
  // 3. 4 CUSTOM 3D TOY TOOL ILLUSTRATIONS (FOR HOTBAR CARDS)
  // --------------------------------------------------------------------------
  tool_upgrade: `<svg viewBox="0 0 64 64" class="tool-svg"><defs>
    <linearGradient id="gUpArrow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#69db7c"/>
      <stop offset="100%" stop-color="#2f9e44"/>
    </linearGradient>
    <linearGradient id="gUpStar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff9db"/>
      <stop offset="55%" stop-color="#ffd43b"/>
      <stop offset="100%" stop-color="#f08c00"/>
    </linearGradient>
  </defs>
  <path d="M32 14 L50 32 H39 V52 H25 V32 H14 Z" fill="url(#gUpArrow)" stroke="#1b4332" stroke-width="3.2" stroke-linejoin="round"/>
  <polygon points="32,6 35.5,13 43,14 37.5,19.5 39,27 32,23.5 25,27 26.5,19.5 21,14 28.5,13" fill="url(#gUpStar)" stroke="#5c3d2e" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="15" cy="16" r="3" fill="#ffd43b"/>
  <circle cx="49" cy="16" r="3" fill="#ffd43b"/>
  </svg>`,

  tool_bridge: `<svg viewBox="0 0 64 64" class="tool-svg"><defs>
    <linearGradient id="gWater" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#74c0fc"/>
      <stop offset="100%" stop-color="#228be6"/>
    </linearGradient>
    <linearGradient id="gPlank" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f4a261"/>
      <stop offset="100%" stop-color="#b5651d"/>
    </linearGradient>
  </defs>
  <rect x="6" y="34" width="52" height="20" rx="8" fill="url(#gWater)" stroke="#1864ab" stroke-width="2.8"/>
  <path d="M14 44 Q23 40 32 44 T50 44" fill="none" stroke="#e7f5ff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M10 38 Q32 20 54 38 L50 44 Q32 28 14 44 Z" fill="url(#gPlank)" stroke="#4a2c11" stroke-width="3" stroke-linejoin="round"/>
  <line x1="16" y1="22" x2="16" y2="36" stroke="#753b09" stroke-width="4" stroke-linecap="round"/>
  <line x1="32" y1="16" x2="32" y2="30" stroke="#753b09" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="22" x2="48" y2="36" stroke="#753b09" stroke-width="4" stroke-linecap="round"/>
  <path d="M16 23 Q32 14 48 23" fill="none" stroke="#ffe8a3" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`,

  tool_spike: `<svg viewBox="0 0 64 64" class="tool-svg"><defs>
    <linearGradient id="gPad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#adb5bd"/>
      <stop offset="100%" stop-color="#495057"/>
    </linearGradient>
    <linearGradient id="gCone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#ced4da"/>
      <stop offset="100%" stop-color="#868e96"/>
    </linearGradient>
  </defs>
  <polygon points="32,26 56,38 32,52 8,38" fill="url(#gPad)" stroke="#212529" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="22,18 28,35 16,35" fill="url(#gCone)" stroke="#343a40" stroke-width="2.4" stroke-linejoin="round"/>
  <polygon points="42,18 48,35 36,35" fill="url(#gCone)" stroke="#343a40" stroke-width="2.4" stroke-linejoin="round"/>
  <polygon points="32,12 39,32 25,32" fill="url(#gCone)" stroke="#343a40" stroke-width="2.6" stroke-linejoin="round"/>
  <polygon points="32,22 39,42 25,42" fill="url(#gCone)" stroke="#343a40" stroke-width="2.6" stroke-linejoin="round"/>
  </svg>`,

  tool_shovel: `<svg viewBox="0 0 64 64" class="tool-svg"><defs>
    <linearGradient id="gSpade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff9db"/>
      <stop offset="50%" stop-color="#ffd43b"/>
      <stop offset="100%" stop-color="#e67700"/>
    </linearGradient>
  </defs>
  <g transform="rotate(35 32 32)">
    <rect x="29" y="10" width="6" height="26" rx="3" fill="#b5651d" stroke="#4a2c11" stroke-width="2.6"/>
    <rect x="23" y="6" width="18" height="7" rx="3.5" fill="#e76f51" stroke="#4a2c11" stroke-width="2.6"/>
    <path d="M20 33 H44 L41 49 C40 54 24 54 23 49 Z" fill="url(#gSpade)" stroke="#5c3d2e" stroke-width="2.8" stroke-linejoin="round"/>
  </g>
  <path d="M14 14 L16 19 L21 21 L16 23 L14 28 L12 23 L7 21 L12 19 Z" fill="#69db7c"/>
  </svg>`,

  // --------------------------------------------------------------------------
  // 4. TOP CONTROL BAR & ROLE BADGE MINI SVGs
  // --------------------------------------------------------------------------
  ctrl_pause: `<svg viewBox="0 0 32 32" class="ctrl-svg"><rect x="8" y="6" width="6" height="20" rx="3" fill="#5c3d2e"/><rect x="18" y="6" width="6" height="20" rx="3" fill="#5c3d2e"/></svg>`,
  ctrl_play: `<svg viewBox="0 0 32 32" class="ctrl-svg"><polygon points="10,6 26,16 10,26" fill="#2b8a3e" stroke="#2b8a3e" stroke-width="2" stroke-linejoin="round"/></svg>`,
  ctrl_cutscene: `<svg viewBox="0 0 32 32" class="ctrl-svg"><rect x="5" y="11" width="22" height="15" rx="3" fill="#7950f2" stroke="#3b096c" stroke-width="2"/><path d="M5 11 L8 6 H25 L27 11 Z" fill="#ffd43b" stroke="#3b096c" stroke-width="2" stroke-linejoin="round"/><polygon points="14,15 21,18.5 14,22" fill="#ffffff"/></svg>`,
  ctrl_zoom: `<svg viewBox="0 0 32 32" class="ctrl-svg"><circle cx="14" cy="14" r="8" fill="#d0ebff" stroke="#1864ab" stroke-width="2.8"/><line x1="20" y1="20" x2="27" y2="27" stroke="#5c3d2e" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  ctrl_wave: `<svg viewBox="0 0 32 32" class="ctrl-svg"><polygon points="18,4 8,17 16,17 13,28 24,14 16,14" fill="#ffd43b" stroke="#5c3d2e" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  ctrl_sandbox: `<svg viewBox="0 0 32 32" class="ctrl-svg"><rect x="6" y="15" width="10" height="10" rx="2" fill="#ff6b6b" stroke="#5c3d2e" stroke-width="2"/><rect x="16" y="15" width="10" height="10" rx="2" fill="#4dabf7" stroke="#5c3d2e" stroke-width="2"/><rect x="11" y="6" width="10" height="10" rx="2" fill="#ffd43b" stroke="#5c3d2e" stroke-width="2"/></svg>`,
  ctrl_music: `<svg viewBox="0 0 32 32" class="ctrl-svg"><path d="M12 22 V8 L24 6 V20" fill="none" stroke="#5c3d2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="22.5" r="4" fill="#f08c00" stroke="#5c3d2e" stroke-width="2"/><circle cx="21.5" cy="20.5" r="4" fill="#f08c00" stroke="#5c3d2e" stroke-width="2"/></svg>`,
  ctrl_sfx: `<svg viewBox="0 0 32 32" class="ctrl-svg"><polygon points="6,12 12,12 18,7 18,25 12,20 6,20" fill="#f08c00" stroke="#5c3d2e" stroke-width="2.2" stroke-linejoin="round"/><path d="M22 11 C25 14 25 18 22 21 M25 8 C30 13 30 19 25 24" fill="none" stroke="#5c3d2e" stroke-width="2.4" stroke-linecap="round"/></svg>`
};

export function miniResSVG(type) {
  return UI_SVGS[type] || UI_SVGS.sun;
}

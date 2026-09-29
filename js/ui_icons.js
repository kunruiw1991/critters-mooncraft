// ============================================================================
// PINTEREST-GRADE 3D-SHADED KAWAII SVG ICON & ILLUSTRATION LIBRARY
// Zero raw OS keycap/photo emojis — cohesive glossy 3D clay/toy vector art
// ============================================================================

export const UI_SVGS = {
  // --------------------------------------------------------------------------
  // 1. 5 CORE RESOURCE & STAT 3D GLOSSY ICONS
  // --------------------------------------------------------------------------
  sun: `<svg viewBox="0 0 48 48" class="svg-ico">
  <circle cx="24" cy="24" r="21" fill="#ffe066" opacity="0.5"/>
  <circle cx="24" cy="24" r="16.5" fill="#f59f00" stroke="#5c3d2e" stroke-width="3"/>
  <circle cx="23" cy="23" r="13.5" fill="#ffd43b"/>
  <ellipse cx="18" cy="16" rx="6" ry="3.2" transform="rotate(-28 18 16)" fill="#ffffff" opacity="0.9"/>
  <circle cx="29" cy="30" r="2.2" fill="#fff9db" opacity="0.8"/>
  </svg>`,

  wood: `<svg viewBox="0 0 48 48" class="svg-ico">
  <g transform="rotate(-12 24 25)">
    <rect x="8" y="14" width="29" height="20" rx="9" fill="#a65a1a" stroke="#4a2c11" stroke-width="3"/>
    <path d="M14 15.5 H31 C34 15.5 35.5 18 35.5 21 H14 Z" fill="#d9822b"/>
    <ellipse cx="13.5" cy="24" rx="6.5" ry="10" fill="#ffe8b6" stroke="#4a2c11" stroke-width="2.8"/>
    <ellipse cx="13.5" cy="24" rx="3.2" ry="5" fill="none" stroke="#b0753b" stroke-width="2"/>
    <path d="M21 19 H32" stroke="#ffd8a8" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
    <path d="M26 13 C27 5.5, 36 5.5, 35 13 C32 15, 28 15, 26 13 Z" fill="#51cf66" stroke="#1b4332" stroke-width="2.4"/>
  </g></svg>`,

  stone: `<svg viewBox="0 0 48 48" class="svg-ico">
  <!-- 3D Isometric Brick Stack / Masonry Brick Block (砖) -->
  <rect x="5" y="24" width="38" height="17" rx="3.5" fill="#d9480f" stroke="#4a1d0c" stroke-width="3"/>
  <rect x="7" y="25.5" width="16.5" height="6.5" rx="1.5" fill="#ff7b54"/>
  <rect x="25.5" y="25.5" width="15.5" height="6.5" rx="1.5" fill="#f76707"/>
  <rect x="7" y="33.5" width="10" height="6" rx="1.5" fill="#e8590c"/>
  <rect x="19" y="33.5" width="12" height="6" rx="1.5" fill="#ff7b54"/>
  <rect x="33" y="33.5" width="8" height="6" rx="1.5" fill="#d9480f"/>
  <line x1="6" y1="32.5" x2="42" y2="32.5" stroke="#fff3d6" stroke-width="2.4"/>
  <line x1="24.5" y1="25" x2="24.5" y2="32.5" stroke="#fff3d6" stroke-width="2.4"/>
  <line x1="18" y1="32.5" x2="18" y2="40" stroke="#fff3d6" stroke-width="2.4"/>
  <line x1="32" y1="32.5" x2="32" y2="40" stroke="#fff3d6" stroke-width="2.4"/>
  <!-- Upper Brick stacked on top with 3D studs -->
  <rect x="11" y="11" width="26" height="13" rx="3" fill="#f76707" stroke="#4a1d0c" stroke-width="3"/>
  <rect x="13" y="12.5" width="22" height="4.5" rx="1.5" fill="#ffa94d"/>
  <line x1="24" y1="12" x2="24" y2="23" stroke="#fff3d6" stroke-width="2.4"/>
  <rect x="15" y="7" width="6" height="4" rx="1.5" fill="#ff922b" stroke="#4a1d0c" stroke-width="2.2"/>
  <rect x="27" y="7" width="6" height="4" rx="1.5" fill="#ff922b" stroke="#4a1d0c" stroke-width="2.2"/>
  </svg>`,

  crystal: `<svg viewBox="0 0 48 48" class="svg-ico">
  <!-- 3D Faceted Brilliant Cut Diamond (钻石) -->
  <polygon points="14,9 34,9 43,20 24,43 5,20" fill="#22b8cf" stroke="#183153" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="14,9 34,9 29,20 19,20" fill="#e3fafc"/>
  <polygon points="5,20 14,9 19,20" fill="#99e9f2"/>
  <polygon points="34,9 43,20 29,20" fill="#66d9e8"/>
  <polygon points="5,20 19,20 24,43" fill="#3bc9db"/>
  <polygon points="19,20 29,20 24,43" fill="#74c0fc"/>
  <polygon points="29,20 43,20 24,43" fill="#1098ad"/>
  <polyline points="5,20 43,20" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
  <polyline points="14,9 19,20 24,43 29,20 34,9" fill="none" stroke="#e3fafc" stroke-width="1.8" stroke-linejoin="round" opacity="0.9"/>
  <path d="M39 6 L40.8 10 L45 11.8 L40.8 13.5 L39 17.5 L37.2 13.5 L33 11.8 L37.2 10 Z" fill="#fff9db" stroke="#f59f00" stroke-width="1.2"/>
  </svg>`,

  core: `<svg viewBox="0 0 48 48" class="svg-ico"><defs>
    <radialGradient id="gStarCore" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#fff9db"/>
      <stop offset="42%" stop-color="#ffd43b"/>
      <stop offset="78%" stop-color="#ae3ec9"/>
      <stop offset="100%" stop-color="#5f3dc4"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="19" fill="#da77f2" opacity="0.32"/>
  <polygon points="24,4 30,16 43,18 33.5,27.5 36,41 24,34.5 12,41 14.5,27.5 5,18 18,16" fill="url(#gStarCore)" stroke="#3b096c" stroke-width="2.8" stroke-linejoin="round"/>
  <polygon points="24,11 28,19 36,20 30,26 31.5,34 24,30 16.5,34 18,26 12,20 20,19" fill="#fff9db" opacity="0.82"/>
  <circle cx="24" cy="23" r="4.5" fill="#ffffff"/>
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
  // 3. CUSTOM 3D TOY TOOL & ADVANCED APEX BUILDING ILLUSTRATIONS
  // --------------------------------------------------------------------------
  bld_cannon: `<svg viewBox="0 0 64 64" class="tool-svg"><defs>
    <linearGradient id="gCanBase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff3bf"/>
      <stop offset="100%" stop-color="#f08c00"/>
    </linearGradient>
    <linearGradient id="gCanBarrel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e5dbff"/>
      <stop offset="55%" stop-color="#7950f2"/>
      <stop offset="100%" stop-color="#3b096c"/>
    </linearGradient>
  </defs>
  <rect x="10" y="42" width="44" height="14" rx="5" fill="url(#gCanBase)" stroke="#4a2c11" stroke-width="2.8"/>
  <circle cx="32" cy="38" r="13" fill="#ffd43b" stroke="#4a2c11" stroke-width="2.8"/>
  <g transform="rotate(-28 32 34)">
    <rect x="24" y="10" width="16" height="28" rx="6" fill="url(#gCanBarrel)" stroke="#240046" stroke-width="2.8"/>
    <ellipse cx="32" cy="11" rx="7" ry="3.5" fill="#fff9db" stroke="#ae3ec9" stroke-width="2"/>
    <circle cx="32" cy="24" r="4.5" fill="#ffd43b" stroke="#3b096c" stroke-width="1.8"/>
  </g>
  <polygon points="49,10 52,16 58,17 53.5,21.5 55,28 49,24.5 43,28 44.5,21.5 40,17 46,16" fill="#ffd43b" stroke="#5f3dc4" stroke-width="1.8"/>
  </svg>`,

  bld_obelisk: `<svg viewBox="0 0 64 64" class="tool-svg"><defs>
    <linearGradient id="gObPillar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e3fafc"/>
      <stop offset="50%" stop-color="#22b8cf"/>
      <stop offset="100%" stop-color="#5f3dc4"/>
    </linearGradient>
  </defs>
  <rect x="12" y="46" width="40" height="10" rx="4" fill="#ffd43b" stroke="#4a2c11" stroke-width="2.8"/>
  <polygon points="32,14 43,46 21,46" fill="url(#gObPillar)" stroke="#183153" stroke-width="2.8" stroke-linejoin="round"/>
  <polygon points="32,14 32,46 21,46" fill="#99e9f2" opacity="0.55"/>
  <path d="M38 6 C29 7 24 14 26 21 C28 26 35 28 41 25 C34 24 31 18 33 12 C34 9 36 7 38 6 Z" fill="#ffd43b" stroke="#5c3d2e" stroke-width="2.2"/>
  <circle cx="32" cy="33" r="4.5" fill="#fff9db" stroke="#ae3ec9" stroke-width="2"/>
  </svg>`,

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
  ctrl_sfx: `<svg viewBox="0 0 32 32" class="ctrl-svg"><polygon points="6,12 12,12 18,7 18,25 12,20 6,20" fill="#f08c00" stroke="#5c3d2e" stroke-width="2.2" stroke-linejoin="round"/><path d="M22 11 C25 14 25 18 22 21 M25 8 C30 13 30 19 25 24" fill="none" stroke="#5c3d2e" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  ctrl_save: `<svg viewBox="0 0 32 32" class="ctrl-svg"><rect x="5" y="5" width="22" height="22" rx="4" fill="#339af0" stroke="#183153" stroke-width="2.2"/><rect x="9" y="5" width="12" height="8" rx="1.5" fill="#e7f5ff" stroke="#183153" stroke-width="1.8"/><rect x="8" y="16" width="16" height="11" rx="2" fill="#ffffff" stroke="#183153" stroke-width="1.8"/></svg>`,
  ctrl_menu: `<svg viewBox="0 0 32 32" class="ctrl-svg"><polygon points="16,4 4,15 8,15 8,27 24,27 24,15 28,15" fill="#ff922b" stroke="#5c3d2e" stroke-width="2.2" stroke-linejoin="round"/><rect x="13" y="18" width="6" height="9" rx="1.5" fill="#fff3bf" stroke="#5c3d2e" stroke-width="1.8"/></svg>`
};

export function miniResSVG(type) {
  return UI_SVGS[type] || UI_SVGS.sun;
}

export const darkTheme = {
  colors: {
    charcoal: '#120e0f',
    surface: '#1c1617',
    surfaceSoft: '#261e20',
    border: '#33282a',
    wine: '#5c061e',
    wineLight: '#7f122c',
    wineGlow: 'rgba(92, 6, 30, 0.15)',
    gold: '#c5a55c',
    goldLight: '#ead297',
    goldGradient: 'linear-gradient(135deg, #a47e3b 0%, #c5a55c 40%, #f3dfb0 75%, #c5a55c 100%)',
    wineGradient: 'linear-gradient(135deg, #240207 0%, #5c061e 60%, #7f122c 100%)',
    ice: '#fcfaf7',
    muted: '#bdaeae',
    mutedDark: '#8a7779',
    success: '#3ca876',
    warning: '#d4a23f',
    danger: '#df5353',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '24px',
  },
  shadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3)',
  glowShadow: '0 0 30px rgba(197, 165, 92, 0.15)',
};

export const lightTheme = {
  colors: {
    charcoal: '#FAF8F5',
    surface: '#ffffff',
    surfaceSoft: '#f3ece9',
    border: '#e4dcd8',
    wine: '#5c061e',
    wineLight: '#7f122c',
    wineGlow: 'rgba(92, 6, 30, 0.06)',
    gold: '#a6833f',
    goldLight: '#c5a55c',
    goldGradient: 'linear-gradient(135deg, #876729 0%, #a6833f 40%, #d4bf8c 75%, #a6833f 100%)',
    wineGradient: 'linear-gradient(135deg, #420412 0%, #5c061e 60%, #7f122c 100%)',
    ice: '#221518', // Deep wine charcoal for high contrast text
    muted: '#7e6a6d',
    mutedDark: '#a59295',
    success: '#2c8f61',
    warning: '#ba8b2d',
    danger: '#cd3d3d',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '24px',
  },
  shadow: '0 20px 50px rgba(43, 30, 33, 0.07), 0 5px 15px rgba(43, 30, 33, 0.03)',
  glowShadow: '0 0 30px rgba(166, 131, 63, 0.08)',
};

// Default theme for backward compatibility
export const theme = darkTheme;

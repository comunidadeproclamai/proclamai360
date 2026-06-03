import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* ─── Reset & Base ──────────────────────────────────────── */
  * {
    box-sizing: border-box;
    transition: background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
  }

  html {
    min-width: 320px;
    background: ${({ theme }) => theme.colors.charcoal};
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    color: ${({ theme }) => theme.colors.ice};
    background:
      radial-gradient(circle at 5% 5%, ${({ theme }) => theme.colors.wineGlow} 0%, transparent 40rem),
      radial-gradient(circle at 95% 95%, rgba(197, 165, 92, 0.06) 0%, transparent 35rem),
      ${({ theme }) => theme.colors.charcoal};
    font-family: 'Montserrat', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ─── Selection ─────────────────────────────────────────── */
  ::selection {
    background: rgba(92, 6, 30, 0.35);
    color: ${({ theme }) => theme.colors.goldLight};
  }

  /* ─── Form Elements ─────────────────────────────────────── */
  button,
  input,
  select,
  textarea {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color 150ms ease;
  }

  /* ─── Root Layout ───────────────────────────────────────── */
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ─── Numeric font ──────────────────────────────────────── */
  .font-numeric {
    font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
  }

  /* ─── Custom Premium Scrollbar ──────────────────────────── */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.charcoal};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    border: 2px solid ${({ theme }) => theme.colors.charcoal};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.wineLight};
  }

  /* ─── Global Keyframes ──────────────────────────────────── */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(100%); }
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes progressShrink {
    from { width: 100%; }
    to   { width: 0%; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

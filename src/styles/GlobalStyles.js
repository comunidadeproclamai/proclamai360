import { createGlobalStyle } from 'styled-components';
import { theme } from './theme.js';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
  }

  html {
    min-width: 320px;
    background: ${theme.colors.charcoal};
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    color: ${theme.colors.ice};
    background:
      radial-gradient(circle at 5% 5%, rgba(92, 6, 30, 0.22) 0%, transparent 40rem),
      radial-gradient(circle at 95% 95%, rgba(197, 165, 92, 0.08) 0%, transparent 35rem),
      ${theme.colors.charcoal};
    font-family: 'Outfit', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

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

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Custom Premium Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.charcoal};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 4px;
    border: 2px solid ${theme.colors.charcoal};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.wineLight};
  }
`;

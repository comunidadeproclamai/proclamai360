import { createGlobalStyle } from 'styled-components';
import { theme } from './theme.js';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    min-width: 320px;
    background: ${theme.colors.charcoal};
  }

  body {
    margin: 0;
    color: ${theme.colors.ice};
    background:
      radial-gradient(circle at top left, rgba(138, 31, 61, 0.18), transparent 34rem),
      ${theme.colors.charcoal};
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
  }

  button,
  input {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  #root {
    min-height: 100vh;
  }
`;

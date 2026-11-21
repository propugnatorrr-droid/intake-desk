import { Global, css } from '@emotion/react';
import { color, font } from '../theme';

const styles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    background: ${color.paper};
    color: ${color.ink};
    font-family: ${font.body};
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  h1,
  h2,
  h3 {
    font-family: ${font.heading};
    line-height: 1.2;
    margin: 0;
    text-wrap: balance;
  }

  p {
    margin: 0;
  }

  a {
    color: inherit;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }

  :focus-visible {
    outline: 3px solid ${color.focus};
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export function GlobalStyles() {
  return <Global styles={styles} />;
}

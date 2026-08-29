/** Tailwind v4 hooks into Next.js through its PostCSS plugin, not the Vite plugin. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;

const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/icons/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '360px',
      ...defaultTheme.screens,
    },
    extend: {
      fontSize: {
        lg: ['1.125rem', '1.5rem'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    base: true,
    styled: true,
    utils: true,
    logs: true,
    prefix: '',
    themeRoot: ':root',
    darkTheme: 'dim',
    themes: ['emerald', 'dim', 'synthwave'],
  },
}

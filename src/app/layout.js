import classNames from 'classnames'
import localFont from 'next/font/local'

import '@/app/globals.css'

export const metadata = {
  title: {
    template: '%s | GameMaster',
    default: 'GameMaster',
  },
  description: 'GameMaster',
}

const nextFont = localFont({
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
  src: [
    {
      path: '../fonts/UbuntuSansMono/Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/UbuntuSansMono/Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/UbuntuSansMono/SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/UbuntuSansMono/Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/UbuntuSansMono/RegularItalic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/UbuntuSansMono/MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/UbuntuSansMono/SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../fonts/UbuntuSansMono/BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
})

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={classNames(nextFont.className, 'text-lg')}>
        {children}
      </body>
    </html>
  )
}

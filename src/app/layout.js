import { Inter } from 'next/font/google'

import '@/app/globals.css'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: '%s | GameMaster',
    default: 'GameMaster',
  },
  description: 'Game Master',
}

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

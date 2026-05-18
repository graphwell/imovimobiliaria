import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Header } from '../components/Header'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imovimobiliaria.com.br'),
  title: {
    default: 'IMOV Imobiliária — Inteligência Imobiliária em Fortaleza',
    template: '%s | IMOV Imobiliária',
  },
  description:
    'Portal imobiliário com inteligência de mercado em Fortaleza e região metropolitana. Compare bairros, simule financiamento e encontre o imóvel ideal.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'IMOV Imobiliária',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const gtmId = process.env['NEXT_PUBLIC_GTM_ID']

  return (
    <html lang="pt-BR" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
      </head>
      <body className="font-body bg-white text-neutral-900 antialiased">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <Header />
        {children}
      </body>
    </html>
  )
}

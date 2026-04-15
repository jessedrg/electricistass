import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Electricistas 24H - Servicio Urgente de Electricidad en España',
    template: '%s | Electricistas 24H',
  },
  description: 'Electricistas 24H - Electricistas profesionales en toda España. Urgencias eléctricas 24 horas, instalaciones, averías y reformas. Llama al 900 433 214. Presupuesto gratis.',
  keywords: ['electricista urgente', 'electricista 24 horas', 'averías eléctricas', 'instalación eléctrica', 'electricista barato', 'urgencias eléctricas', '900 433 214'],
  generator: 'v0.app',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.instalacioneselectricasjj.com'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Electricistas 24H',
    images: ['/logo.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        <WhatsAppButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

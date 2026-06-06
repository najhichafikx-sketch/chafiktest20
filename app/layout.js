import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MonetagProvider from '@/components/MonetagProvider';
import MonetagServiceWorker from '@/components/MonetagServiceWorker';
import AdsterraBanner from '@/components/AdsterraBanner';
import { WebsiteSchema, OrganizationSchema, SoftwareAppSchema, JsonLd } from '@/lib/seo';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com';
const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-GWVTS5V577';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Chafiktech Ai - Advanced AI SaaS Platform for Content Creation',
    template: '%s | Chafiktech Ai'
  },
  description: 'Create stunning content with AI superpowers. Chafiktech Ai provides next-generation AI tools for content creation, SEO optimization, and digital product development.',
  keywords: ['AI tools', 'content creation', 'SEO article generator', 'image to prompt', 'video to prompt', 'AI humanizer', 'TikTok tools', 'YouTube suite', 'digital product creator'],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Chafiktech Ai',
    title: 'Chafiktech Ai - Advanced AI SaaS Platform',
    description: 'Create stunning content with AI superpowers. Next-generation AI tools for content creation and optimization.',
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chafiktech Ai - Advanced AI SaaS Platform',
    description: 'Create stunning content with AI superpowers.',
    images: ['/og-image.png']
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <JsonLd data={WebsiteSchema({
          name: 'Chafiktech Ai',
          url: siteUrl,
          description: 'AI-powered SaaS platform for content creators'
        })} />
        <JsonLd data={OrganizationSchema({
          name: 'Chafiktech Ai',
          url: siteUrl,
          logo: `${siteUrl}/favicon.svg`
        })} />
        <JsonLd data={SoftwareAppSchema({
          name: 'Chafiktech Ai',
          description: 'AI-powered content creation platform',
          url: siteUrl
        })} />
      </head>
      <body className="bg-mesh bg-grid">
        <AnalyticsTracker />
        <MonetagServiceWorker />
        <Navbar />
        <AdsterraBanner />
        <MonetagProvider>{children}</MonetagProvider>
        <Footer />

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; window.GA_MEASUREMENT_ID = '${gaId}'; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}', { page_path: window.location.pathname });`}
        </Script>

        <Script src="https://5gvci.com/pfe/current/tag.min.js?z=11103150" data-cfasync="false" strategy="beforeInteractive" />
        <Script src="https://quge5.com/88/tag.min.js" data-zone="246361" async data-cfasync="false" strategy="beforeInteractive" />
        <Script id="monetag-onclick" strategy="beforeInteractive">{`(function(s){s.dataset.zone='11103201',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}</Script>
        <Script id="monetag-inpage-push" strategy="afterInteractive">{`(function(s){s.dataset.zone='11103207',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}</Script>
      </body>
    </html>
  );
}

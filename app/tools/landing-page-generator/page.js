import LandingPageClient from './LandingPageClient';

export const metadata = {
  title: 'AI Landing Page Generator - High-Converting SaaS Pages | ChafikTech',
  description: 'Generate professional, high-converting landing pages with AI. HTML, React, Next.js, TailwindCSS, SEO metadata, image prompts, and conversion-optimized copy. SaaS-quality design with dark mode.',
  keywords: 'AI landing page generator, landing page builder, SaaS landing page, conversion optimized, lead generation page, React landing page, Next.js landing page, Tailwind landing page, AI page builder',
  openGraph: {
    title: 'AI Landing Page Generator - Create High-Converting Pages in Seconds',
    description: 'Generate complete landing pages with AI: hero, benefits, features, testimonials, FAQ, CTA. Export HTML, React, Next.js, TailwindCSS. SEO-optimized with image prompts.',
    type: 'website',
    images: [{ url: '/og-landing-page.png', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Landing Page Generator - Create High-Converting Pages in Seconds',
    description: 'Generate complete landing pages with AI. Export HTML, React, Next.js, TailwindCSS. SEO-optimized with image prompts.',
  },
};

export default function Page() {
  return <LandingPageClient />;
}

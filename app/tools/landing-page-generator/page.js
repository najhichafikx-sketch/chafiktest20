import LandingPageClient from './LandingPageClient';

export const metadata = {
  title: 'AI Landing Page Generator — Create Pages in 6 Languages',
  description: 'Generate professional, mobile-ready landing pages in seconds. Dark theme, drag-and-drop images, social media integration, 6 languages (EN/AR/FR/ES/TR/DE), instant HTML & PNG export.',
  keywords: 'AI landing page generator, landing page AI, create landing page, multilingual landing page, html landing page, drag drop landing page',
  openGraph: {
    title: 'AI Landing Page Generator',
    description: 'Create professional, multilingual landing pages with AI in seconds.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Landing Page Generator',
    description: 'Create professional, multilingual landing pages with AI in seconds.',
  },
};

export default function Page() {
  return <LandingPageClient />;
}

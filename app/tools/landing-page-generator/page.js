import LandingPageClient from './LandingPageClient';

export const metadata = {
  title: 'AI Landing Page Generator',
  description: 'Create professional landing pages in seconds with AI-powered templates, live preview, and instant HTML export. 6 templates: SaaS, Mobile App, Agency, Event, Coming Soon, Portfolio.',
  openGraph: {
    title: 'AI Landing Page Generator',
    description: 'Create professional landing pages in seconds with AI-powered templates, live preview, and instant HTML export.',
  },
  twitter: {
    title: 'AI Landing Page Generator',
    description: 'Create professional landing pages in seconds with AI-powered templates, live preview, and instant HTML export.',
  },
};

export default function Page() {
  return <LandingPageClient />;
}

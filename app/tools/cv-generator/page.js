import CVGeneratorClient from './CVGeneratorClient';

export const metadata = {
  title: 'AI CV Generator — Build a Professional Resume in Minutes',
  description: 'Create a polished, professional CV with our free AI CV Generator. Multi-step builder, profile photo upload, 5+ templates, export to PDF and Word. No sign-up required.',
  keywords: 'AI CV generator, resume builder, free CV maker, professional resume, PDF resume, Word resume',
  openGraph: {
    title: 'AI CV Generator — Build a Professional Resume',
    description: 'Create a polished CV in minutes with our free multi-step builder. Export to PDF and Word.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI CV Generator — Build a Professional Resume',
    description: 'Create a polished CV in minutes. Export to PDF and Word.',
  },
};

export default function Page() {
  return <CVGeneratorClient />;
}

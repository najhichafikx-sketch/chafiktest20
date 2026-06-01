import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Content Detector & Humanizer',
  description: 'Detect AI-generated text instantly and rewrite it to sound naturally human, engaging, and SEO-ready.'
};

export default function Page() {
  return <ToolPage icon="🤖" title="AI Content Detector & Humanizer"
    description="Detect AI-generated text instantly and rewrite it to sound naturally human, engaging, and SEO-ready."
    toolId="ai-humanizer" placeholder="Paste your AI-generated text to humanize..." showSidebar />;
}

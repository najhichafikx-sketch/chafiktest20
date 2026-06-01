import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Landing Page Generator',
  description: 'Generate high-converting landing page copy with AI-powered headlines, subheadlines, bullet points, and CTAs.'
};

export default function Page() {
  return <ToolPage icon="🌐" title="Landing Page Generator"
    description="Generate high-converting landing page copy with AI."
    toolId="landing-page" placeholder="Describe your product or service..." showSidebar />;
}

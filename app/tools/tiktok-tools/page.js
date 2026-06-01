import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI TikTok Creator Suite',
  description: 'Generate viral TikTok scripts, find trending sounds, and optimize hashtags with AI-powered tools for TikTok growth.'
};

export default function Page() {
  return <ToolPage icon="🎵" title="AI Tiktok Creator Suite"
    description="Generate viral scripts, find trending sounds, and optimize your hashtags."
    toolId="tiktok-tools" placeholder="Enter your TikTok niche or topic..." showSidebar />;
}

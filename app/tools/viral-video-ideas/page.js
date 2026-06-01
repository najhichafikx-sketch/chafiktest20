import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Viral Video Idea Generator - AI YouTube Content Ideas',
  description: 'Generate viral YouTube video ideas with AI. Get trending content concepts, video angles, and audience-targeted ideas for your channel growth.'
};

export default function Page() {
  return <ToolPage icon="💡" title="Viral Video Idea Generator"
    description="Generate viral YouTube video concepts, trending ideas, and audience-targeted content angles."
    toolId="viral-ideas" placeholder="Enter your YouTube channel niche (e.g., tech reviews, cooking, gaming...)..." showSidebar />;
}

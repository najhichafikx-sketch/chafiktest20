import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'YouTube Description Generator - AI SEO Descriptions',
  description: 'Generate SEO-optimized YouTube descriptions with hashtags, keywords, and timestamps to rank higher in search.'
};

export default function Page() {
  return <ToolPage icon="📋" title="YouTube Description Generator"
    description="Generate SEO descriptions, hashtags, and keywords optimized for YouTube search."
    toolId="youtube-description" placeholder="Enter your video title and target keywords..." showSidebar />;
}

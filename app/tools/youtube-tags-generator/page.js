import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'YouTube Tags Generator - AI Video Tag Optimization',
  description: 'Generate relevant YouTube tags and long-tail keywords optimized for search discovery and video ranking.'
};

export default function Page() {
  return <ToolPage icon="🏷️" title="YouTube Tags Generator"
    description="Generate relevant tags, long-tail keywords, and search-optimized categories."
    toolId="youtube-tags" placeholder="Enter your video topic and primary keyword..." showSidebar />;
}

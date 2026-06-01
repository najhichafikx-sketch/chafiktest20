import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Video Content Repurposer - AI Multi-Platform Content',
  description: 'Convert YouTube videos into blog articles, Twitter threads, Instagram posts, and LinkedIn content with AI.'
};

export default function Page() {
  return <ToolPage icon="🔄" title="Video Content Repurposer"
    description="Convert your video into blog articles, Twitter threads, Instagram posts, and LinkedIn content."
    toolId="video-repurposer" placeholder="Paste your video transcript, description, or notes..." showSidebar />;
}

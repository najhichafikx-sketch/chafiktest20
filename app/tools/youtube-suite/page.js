import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI YouTube Creator Suite',
  description: '12 AI-powered tools for YouTube thumbnails, transcripts, SEO optimization, viral ideas, channel analysis, and growth planning.'
};

export default function Page() {
  return <ToolPage icon="📺" title="AI Youtube Creator Suite"
    description="12 AI tools for thumbnails, transcripts, SEO, viral ideas, channel analysis, and growth planning."
    toolId="youtube-suite" placeholder="Enter your YouTube topic or channel URL..." showSidebar />;
}

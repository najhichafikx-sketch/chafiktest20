import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'YouTube Title Generator - AI SEO Video Titles',
  description: 'Generate SEO-optimized YouTube titles, clickable headlines, and Shorts titles that rank higher and get more views.'
};

export default function Page() {
  return <ToolPage icon="📺" title="YouTube Title Generator"
    description="Generate SEO-optimized, clickable YouTube titles that boost CTR and rankings."
    toolId="youtube-title" placeholder="Enter your video topic or keyword..." showSidebar />;
}

import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'YouTube SEO Optimizer - AI Video Ranking Analysis',
  description: 'Analyze your YouTube title and description. Get an SEO score and actionable suggestions to rank higher in search results.'
};

export default function Page() {
  return <ToolPage icon="🔍" title="YouTube SEO Optimizer"
    description="Analyze your title and description. Get a detailed SEO score and optimization suggestions."
    toolId="youtube-seo" placeholder='Paste your video title first, then description. Example: "My Title | My Description"' showSidebar />;
}

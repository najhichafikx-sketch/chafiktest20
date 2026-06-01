import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Community Post Generator - AI YouTube Engagement',
  description: 'Generate engaging YouTube Community posts, polls, and discussion starters to boost audience interaction.'
};

export default function Page() {
  return <ToolPage icon="📢" title="Community Post Generator"
    description="Generate polls, community posts, and engagement content for your YouTube channel."
    toolId="community-post" placeholder="Describe your channel and what you want to post about..." showSidebar />;
}

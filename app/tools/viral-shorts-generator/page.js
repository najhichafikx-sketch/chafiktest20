import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Viral Shorts Generator - AI YouTube Shorts Scripts',
  description: 'Generate viral YouTube Shorts scripts for 30, 45, and 60 second durations. Optimized for retention and engagement.'
};

export default function Page() {
  return <ToolPage icon="📱" title="Viral Shorts Generator"
    description="Generate viral-optimized Shorts scripts for 30s, 45s, and 60s durations."
    toolId="viral-shorts" placeholder="Enter your Shorts topic..." showSidebar />;
}

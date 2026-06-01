import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'YouTube Script Generator - AI Video Script Writer',
  description: 'Generate complete YouTube scripts for Shorts, long-form videos, and faceless channels. Includes intros, main content, and CTAs.'
};

export default function Page() {
  return <ToolPage icon="📜" title="YouTube Script Generator"
    description="Generate complete video scripts with hook, main content, and powerful CTA."
    toolId="youtube-script" placeholder="Enter your video topic. Specify format: Shorts / Long-form / Faceless..." showSidebar />;
}

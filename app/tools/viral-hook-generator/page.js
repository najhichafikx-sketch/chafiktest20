import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Viral Hook Generator - Scroll-Stopping Video Hooks',
  description: 'Generate attention-grabbing video hooks for YouTube. First 5 seconds, 15 seconds, and full scroll-stopping hooks that boost retention.'
};

export default function Page() {
  return <ToolPage icon="🪝" title="Viral Hook Generator"
    description="Generate scroll-stopping hooks that grab attention in the first 5 seconds."
    toolId="viral-hook" placeholder="Describe your video topic and target audience..." showSidebar />;
}

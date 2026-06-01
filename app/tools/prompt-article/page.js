import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Article Prompt Generator',
  description: 'Generate perfectly structured article prompts for AI writing tools. Get better output with optimized prompts.'
};

export default function Page() {
  return <ToolPage icon="📄" title="Prompt Article"
    description="Generate perfectly structured article prompts for AI writing tools."
    toolId="prompt-article" placeholder="Enter your article topic..." showSidebar />;
}

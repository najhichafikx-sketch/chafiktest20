import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Storytelling Script Generator - AI Narrative Videos',
  description: 'Generate storytelling-driven YouTube scripts for history, mystery, documentary, and educational channels.'
};

export default function Page() {
  return <ToolPage icon="📖" title="Storytelling Script Generator"
    description="Generate narrative-driven scripts for history, mystery, documentary, and educational channels."
    toolId="storytelling-script" placeholder="Enter your story topic and channel type (history/mystery/documentary/educational)..." showSidebar />;
}

import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Faceless Video Generator - AI Script & Visual Prompts',
  description: 'Generate complete faceless video packages: scripts, voiceover prompts, visual prompts, and B-roll suggestions for YouTube.'
};

export default function Page() {
  return <ToolPage icon="🎭" title="Faceless Video Generator"
    description="Generate scripts, voiceover prompts, visual prompts, and B-roll suggestions for faceless channels."
    toolId="faceless-video" placeholder="Enter your video topic and niche (tech, finance, history, etc.)..." showSidebar />;
}

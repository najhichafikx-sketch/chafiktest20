import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Thumbnail Prompt Generator - AI YouTube Thumbnails',
  description: 'Generate AI thumbnail prompts with subject, colors, composition, and emotion for click-worthy YouTube thumbnails.'
};

export default function Page() {
  return <ToolPage icon="🖼️" title="Thumbnail Prompt Generator"
    description="Generate AI prompts for eye-catching YouTube thumbnails that drive clicks."
    toolId="thumbnail-prompt" placeholder="Describe your video topic and desired emotion..." showSidebar />;
}

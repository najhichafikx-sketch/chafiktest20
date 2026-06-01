import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Video to Prompt Generator',
  description: 'Transform any video into detailed, creative AI prompts for Midjourney, DALL-E, and other AI image generators.'
};

export default function Page() {
  return <ToolPage icon="🎥" title="Video To Prompt"
    description="Transform any video into detailed, creative AI prompts for your next project."
    toolId="video-to-prompt" hasUpload showSidebar />;
}

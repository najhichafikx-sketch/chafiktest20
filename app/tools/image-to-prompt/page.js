import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Image to Prompt Generator',
  description: 'Upload any image and instantly generate ultra-detailed, professional prompts for Midjourney, DALL-E, and Stable Diffusion.'
};

export default function Page() {
  return <ToolPage icon="📸" title="Image to Prompt Generator"
    description="Upload any image and instantly generate an ultra-detailed, professional prompt for Midjourney & DALL-E."
    toolId="image-to-prompt" hasUpload showSidebar />;
}

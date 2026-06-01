import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Comment Reply Generator - AI YouTube Responses',
  description: 'Generate professional, engaging replies to YouTube comments. Build community with AI-powered responses.'
};

export default function Page() {
  return <ToolPage icon="💬" title="Comment Reply Generator"
    description="Generate professional replies to YouTube comments that build community."
    toolId="comment-reply" placeholder="Paste the YouTube comment and select tone (professional/friendly/humorous/educational)..." showSidebar />;
}

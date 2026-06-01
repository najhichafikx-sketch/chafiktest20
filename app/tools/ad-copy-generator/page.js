import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Ad Copy Generator',
  description: 'Generate high-converting ad copy for Google Ads, Facebook Ads, Instagram, and LinkedIn marketing campaigns.'
};

export default function Page() {
  return <ToolPage icon="📢" title="Ad Copy Generator"
    description="Generate high-converting ad copy for your marketing campaigns."
    toolId="ad-copy" placeholder="Describe your product or service..." showSidebar />;
}

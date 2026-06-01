import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Sales Copy Generator',
  description: 'Generate persuasive sales copy that converts visitors into customers. AI-powered copywriting for landing pages and emails.'
};

export default function Page() {
  return <ToolPage icon="💰" title="Sales Copy Generator"
    description="Generate persuasive sales copy that converts."
    toolId="sales-copy" placeholder="Describe your offer and target audience..." showSidebar />;
}

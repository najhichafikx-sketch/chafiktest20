import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Dropshipping Research Tool',
  description: 'Find profitable dropshipping products with AI-powered market research, trend analysis, and competition validation.'
};

export default function Page() {
  return <ToolPage icon="🔍" title="Dropshipping Research"
    description="Find profitable dropshipping products with AI-powered research."
    toolId="dropshipping-research" placeholder="Enter a product niche or category..." />;
}

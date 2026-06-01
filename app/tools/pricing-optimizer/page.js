import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Pricing Optimizer',
  description: 'Find the perfect price point for your products with AI-driven market analysis, competitor research, and customer insights.'
};

export default function Page() {
  return <ToolPage icon="💲" title="Pricing Optimizer"
    description="Find the perfect price point with AI-driven analysis."
    toolId="pricing-optimizer" placeholder="Describe your product and target market..." />;
}

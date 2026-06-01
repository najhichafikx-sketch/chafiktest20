import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Product Idea Finder',
  description: 'Discover profitable product ideas for your e-commerce store with AI-powered market research and trend analysis.'
};

export default function Page() {
  return <ToolPage icon="💡" title="Product Idea Finder"
    description="Discover profitable product ideas with AI research."
    toolId="product-idea" placeholder="Describe your niche or target audience..." />;
}

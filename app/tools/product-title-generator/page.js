import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Product Title Generator',
  description: 'Generate SEO-optimized product titles that rank higher in search results and drive more clicks and sales.'
};

export default function Page() {
  return <ToolPage icon="📌" title="Product Title Generator"
    description="Generate SEO-optimized product titles for more sales."
    toolId="product-title" placeholder="Describe your product..." />;
}

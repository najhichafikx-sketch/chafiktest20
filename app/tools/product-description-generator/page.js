import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Product Description Generator',
  description: 'Generate compelling product descriptions that drive sales. AI-powered copywriting for e-commerce product pages.'
};

export default function Page() {
  return <ToolPage icon="📋" title="Product Description Generator"
    description="Generate compelling product descriptions that drive sales."
    toolId="product-description" placeholder="Enter product name and features..." showSidebar />;
}

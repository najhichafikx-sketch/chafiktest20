import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Shopify SEO Generator',
  description: 'Generate SEO-optimized product titles, descriptions, and meta tags for your Shopify store to drive organic traffic.'
};

export default function Page() {
  return <ToolPage icon="🛍️" title="Shopify SEO Generator"
    description="Generate SEO-optimized content for your Shopify store."
    toolId="shopify-seo" placeholder="Enter your product name and keywords..." showSidebar />;
}

import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'SEO Article Generator',
  description: 'Generate 100% original SEO articles, titles, keywords, and topic ideas optimized for Google rankings and AdSense approval.'
};

export default function Page() {
  return <ToolPage icon="📝" title="SEO Article Generator"
    description="Generate 100% original SEO articles, titles, keywords, and topic ideas optimized for Google & AdSense."
    toolId="seo-article" placeholder="Enter your topic or keywords..." showSidebar />;
}

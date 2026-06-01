import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Etsy Listing Generator',
  description: 'Optimize your Etsy listings with SEO-friendly titles, tags, and descriptions that rank higher in Etsy search results.'
};

export default function Page() {
  return <ToolPage icon="🪡" title="Etsy Listing Generator"
    description="Create SEO-optimized Etsy listings that rank higher."
    toolId="etsy-listing" placeholder="Describe your Etsy product..." showSidebar />;
}

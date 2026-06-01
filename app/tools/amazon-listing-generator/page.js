import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Amazon Listing Generator',
  description: 'Create optimized Amazon product listings with high-converting titles, bullet points, and descriptions that rank.'
};

export default function Page() {
  return <ToolPage icon="📦" title="Amazon Listing Generator"
    description="Create optimized Amazon product listings that convert."
    toolId="amazon-listing" placeholder="Enter your product details..." showSidebar />;
}

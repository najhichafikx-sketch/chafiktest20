import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Digital Product Name Generator',
  description: 'Generate catchy, memorable names for your digital products, courses, templates, and online offerings.'
};

export default function Page() {
  return <ToolPage icon="🏷️" title="Digital Product Name Generator"
    description="Generate catchy names for your digital products."
    toolId="digital-product-name" placeholder="Describe your digital product..." />;
}

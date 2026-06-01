import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Product Image Enhancer',
  description: 'Generate AI-powered prompts to enhance and optimize your product images for better conversions and visual appeal.'
};

export default function Page() {
  return <ToolPage icon="🖼️" title="Product Image Enhancer"
    description="Enhance product images with AI-powered prompts."
    toolId="product-image" placeholder="Describe your product image and desired style..." />;
}

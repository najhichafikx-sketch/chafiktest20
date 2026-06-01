import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'AI Digital Product Creator',
  description: 'Create and optimize digital products with AI assistance. Generate product ideas, descriptions, and marketing copy.'
};

export default function Page() {
  return <ToolPage icon="💡" title="AI Digital Product Creator"
    description="Create and optimize digital products with AI assistance."
    toolId="digital-product" placeholder="Describe your digital product idea..." showSidebar />;
}

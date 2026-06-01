import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Digital Product Email Writer',
  description: 'Write compelling email sequences for your digital products. Generate launch emails, follow-ups, and sales copy.'
};

export default function Page() {
  return <ToolPage icon="✉️" title="Digital Product Email Writer"
    description="Write compelling email sequences for your digital products."
    toolId="digital-product-email" placeholder="Describe your digital product and target audience..." />;
}

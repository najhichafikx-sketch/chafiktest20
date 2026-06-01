import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Review Response Generator',
  description: 'Generate professional, empathetic responses to customer reviews. Improve your reputation with AI-powered reply automation.'
};

export default function Page() {
  return <ToolPage icon="⭐" title="Review Response Generator"
    description="Generate professional responses to customer reviews."
    toolId="review-response" placeholder="Paste the customer review..." />;
}

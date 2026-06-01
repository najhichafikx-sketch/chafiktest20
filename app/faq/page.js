import FAQClient from './FAQClient';
import { FAQPageSchema, JsonLd } from '@/lib/seo';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Chafiktech Ai - pricing, features, API access, and more.'
};

const faqQuestions = [
  { question: 'How does the Free plan work?', answer: 'The Free plan gives you access to a limited number of generations (5 per day) and access to one primary tool so you can test the platform capabilities before committing. No credit card is required.' },
  { question: 'Can I cancel my subscription anytime?', answer: 'Yes, absolutely. You can upgrade, downgrade, or cancel your subscription at any time right from your dashboard. If you cancel, you will retain access until the end of your billing period.' },
  { question: 'What exactly is the Video to Prompt tool?', answer: 'It is an advanced AI model that analyzes any video you upload and reverse-engineers it into highly detailed text prompts. This is perfect for recreating specific styles, lighting, or compositions in AI generators.' },
  { question: 'Do I need technical skills to use Chafiktech Ai?', answer: 'Not at all! We have designed Chafiktech Ai to be incredibly intuitive and user-friendly. If you know how to copy and paste, you can start generating professional-grade content immediately.' },
  { question: 'Is there an API available for developers?', answer: 'Yes! API access is available on our Pro and Business plans. You can generate API keys directly from your dashboard to integrate our AI tools into your own applications or workflows.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and cryptocurrency payments. All transactions are processed securely through industry-standard encryption.' },
  { question: 'How do I get started?', answer: 'Simply create a free account, choose a tool from our arsenal, enter your input, and let our AI generate professional-grade content for you in seconds.' }
];

export default function FAQPage() {
  return (
    <>
      <JsonLd data={FAQPageSchema(faqQuestions)} />
      <FAQClient questions={faqQuestions} />
    </>
  );
}

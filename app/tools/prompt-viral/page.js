import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Viral Prompt Generator',
  description: 'Generate highly engaging AI prompts tailored for major AI image and text models to create viral content.'
};

export default function Page() {
  return <ToolPage icon="🚀" title="Prompt Viral"
    description="Generate highly engaging prompts tailored for major AI image/text models."
    toolId="prompt-viral" placeholder="Describe the type of viral prompt you need..." showSidebar />;
}

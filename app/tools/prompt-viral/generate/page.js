import ToolPage from '@/components/ToolPage';

export const metadata = {
  title: 'Generate Viral Prompts with AI - ChafikTech',
  description: 'Generate highly engaging AI prompts tailored for major AI image and text models to create viral content.',
};

export default function GeneratePage() {
  return (
    <>
      <div style={{ padding: '16px 24px 0', maxWidth: 1100, margin: '0 auto' }}>
        <a href="/tools/prompt-viral" style={{ color: 'var(--neon-purple)', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ← Back to saved prompts
        </a>
      </div>
      <ToolPage icon="🚀" title="Prompt Viral"
        description="Generate highly engaging prompts tailored for major AI image/text models."
        toolId="prompt-viral" placeholder="Describe the type of viral prompt you need..." showSidebar />
    </>
  );
}

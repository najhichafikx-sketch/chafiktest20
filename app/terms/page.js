export const metadata = {
  title: 'Terms of Service',
  description: 'Chafiktech Ai Terms of Service - Guidelines for using our AI-powered content creation platform.'
};

export default function TermsPage() {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-badge">📜 Terms</span>
          <h1 className="section-title">Terms of Service</h1>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Acceptance of Terms</h3>
          <p style={{ marginBottom: 16 }}>By accessing and using Chafiktech Ai, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Usage Guidelines</h3>
          <p style={{ marginBottom: 16 }}>You agree to use our AI tools responsibly and not to generate content that is illegal, harmful, or violates the rights of others. We reserve the right to suspend accounts that violate these guidelines.</p>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Intellectual Property</h3>
          <p style={{ marginBottom: 16 }}>Content generated using our tools belongs to you. However, you grant us a license to use feedback and suggestions for service improvement.</p>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Limitation of Liability</h3>
          <p style={{ marginBottom: 16 }}>Chafiktech Ai is provided as-is. We are not liable for damages arising from the use or inability to use our services.</p>
        </div>
      </div>
    </section>
  );
}

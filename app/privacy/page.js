export const metadata = {
  title: 'Privacy Policy',
  description: 'Chafiktech Ai Privacy Policy - Learn how we collect, use, and protect your personal data.'
};

export default function PrivacyPage() {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-badge">🔒 Privacy</span>
          <h1 className="section-title">Privacy Policy</h1>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Information We Collect</h3>
          <p style={{ marginBottom: 16 }}>We collect information you provide when creating an account, including your email address. We also collect usage data such as the tools you use and the content you generate to improve our services.</p>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>How We Use Your Information</h3>
          <p style={{ marginBottom: 16 }}>Your information is used to provide and improve our AI services, process transactions, send service updates, and ensure platform security. We do not sell your personal data to third parties.</p>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Data Security</h3>
          <p style={{ marginBottom: 16 }}>We implement industry-standard security measures to protect your data, including encryption at rest and in transit, regular security audits, and strict access controls.</p>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 }}>Contact</h3>
          <p>For privacy-related inquiries, contact us at tools@chafiktech.com.</p>
        </div>
      </div>
    </section>
  );
}

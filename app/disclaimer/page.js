export const metadata = {
  title: 'Disclaimer',
  description: 'Chafiktech Ai Disclaimer - Important information about the use of AI-generated content on our platform.'
};

export default function DisclaimerPage() {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-badge">⚠️ Disclaimer</span>
          <h1 className="section-title">Disclaimer</h1>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 16 }}>The AI-generated content provided by Chafiktech Ai is for informational and creative purposes only. While we strive for accuracy and quality, we make no guarantees regarding the completeness, reliability, or suitability of the generated content.</p>
          <p style={{ marginBottom: 16 }}>Users are responsible for reviewing and verifying AI-generated content before publishing or using it commercially. Chafiktech Ai shall not be held liable for any losses, damages, or claims arising from the use of AI-generated content.</p>
          <p style={{ marginBottom: 16 }}>All trademarks and copyrights belong to their respective owners. Reference to third-party products or services does not constitute endorsement.</p>
        </div>
      </div>
    </section>
  );
}

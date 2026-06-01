export default function Loading() {
  return (
    <section className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="saas-spinner" style={{ margin: '0 auto 24px', width: 48, height: 48, borderWidth: 4 }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </section>
  );
}

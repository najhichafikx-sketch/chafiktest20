'use client';

export default function Error({ error, reset }) {
  return (
    <section className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>⚠️</div>
        <h1 className="section-title" style={{ marginBottom: 16 }}>Something went wrong</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button className="btn btn-primary" onClick={() => reset()}>Try Again</button>
      </div>
    </section>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>404</div>
        <h1 className="section-title" style={{ marginBottom: 16 }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    </section>
  );
}

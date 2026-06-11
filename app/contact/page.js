'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <section className="section auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <h1>Contact Us</h1>
          <p>Have questions? We would love to hear from you.</p>
        </div>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input" style={{ minHeight: 120, resize: 'vertical' }} placeholder="Your message..." required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Send Message</button>
          </form>
        )}
        <div className="auth-footer" style={{ marginTop: 20 }}>
          <p>Email: tools@chafiktech.com</p>
          <p>Website: www.chafiktech.com</p>
        </div>
      </div>
    </section>
  );
}

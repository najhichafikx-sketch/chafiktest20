'use client';

import Link from 'next/link';

export default function PricingClient() {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge">💰 Flexible Plans</span>
          <h1 className="section-title">Simple, Transparent Pricing</h1>
          <p className="section-subtitle">Choose the perfect plan for your content creation journey.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-name">Free</h3>
            <p className="pricing-desc">Perfect to test the waters.</p>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value">0</span>
              <span className="pricing-period">/month</span>
            </div>
            <div className="pricing-divider"></div>
            <div className="pricing-features">
              <PricingFeature checked>5 generations / day</PricingFeature>
              <PricingFeature checked>1 tool access</PricingFeature>
              <PricingFeature checked>Basic support</PricingFeature>
              <PricingFeature checked>Community access</PricingFeature>
              <PricingFeature checked={false}>API Access</PricingFeature>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ width: '100%' }}>Start for Free</Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-popular">Most Popular</div>
            <h3 className="pricing-name">Pro</h3>
            <p className="pricing-desc">For serious creators & professionals.</p>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value text-gradient">29</span>
              <span className="pricing-period">/month</span>
            </div>
            <div className="pricing-divider"></div>
            <div className="pricing-features">
              <PricingFeature checked>Unlimited generations</PricingFeature>
              <PricingFeature checked>All tools access</PricingFeature>
              <PricingFeature checked>Priority support</PricingFeature>
              <PricingFeature checked>API access</PricingFeature>
              <PricingFeature checked>Advanced analytics</PricingFeature>
            </div>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%' }}>Upgrade to Pro</Link>
          </div>
          <div className="pricing-card">
            <h3 className="pricing-name">Business</h3>
            <p className="pricing-desc">For teams and agencies.</p>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value">99</span>
              <span className="pricing-period">/month</span>
            </div>
            <div className="pricing-divider"></div>
            <div className="pricing-features">
              <PricingFeature checked>Everything in Pro</PricingFeature>
              <PricingFeature checked>Team collaboration</PricingFeature>
              <PricingFeature checked>Custom integrations</PricingFeature>
              <PricingFeature checked>Dedicated manager</PricingFeature>
              <PricingFeature checked>SLA guarantee</PricingFeature>
            </div>
            <Link href="/contact" className="btn btn-outline" style={{ width: '100%' }}>Contact Sales</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingFeature({ checked, children }) {
  return (
    <div className="pricing-feature">
      {checked ? (
        <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
      <span style={checked ? {} : { color: 'var(--text-muted)' }}>{children}</span>
    </div>
  );
}

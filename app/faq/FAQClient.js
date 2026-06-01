'use client';

export default function FAQClient({ questions }) {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge">❓ FAQ</span>
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">Everything you need to know about Chafiktech Ai.</p>
        </div>
        <div className="faq-list" style={{ maxWidth: 800, margin: '0 auto' }}>
          {questions.map((q, i) => (
            <FAQItem key={i} question={q.question}>{q.answer}</FAQItem>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, children }) {
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={(e) => {
        const item = e.currentTarget.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => {
          el.classList.remove('active');
          const ans = el.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = '0';
        });
        if (!isActive) {
          item.classList.add('active');
          const ans = item.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
        }
      }}>
        {question}
        <span className="faq-icon">+</span>
      </div>
      <div className="faq-answer">
        <div className="faq-answer-content">{children}</div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './cv-generator.module.css';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: '👤' },
  { id: 2, title: 'Experience', icon: '💼' },
  { id: 3, title: 'Skills', icon: '🎯' },
  { id: 4, title: 'Education', icon: '🎓' },
  { id: 5, title: 'Hobbies', icon: '⚽' },
  { id: 6, title: 'Preview', icon: '📄' }
];

const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate (PhD)',
  'Diploma',
  'Certificate',
  'Self-taught',
  'Other'
];

const SKILL_LEVELS = [
  { id: 'Beginner', value: 25, color: '#94a3b8' },
  { id: 'Intermediate', value: 50, color: '#3b82f6' },
  { id: 'Advanced', value: 75, color: '#8b5cf6' },
  { id: 'Expert', value: 100, color: '#10b981' }
];

const HOBBY_EMOJIS = [
  '⚽', '🏀', '🎾', '🏊', '🚴', '🏃', '🧘', '🎨',
  '🎵', '🎸', '🎮', '📚', '✍️', '📷', '🎬', '🍳',
  '🌱', '✈️', '🗺️', '🎲', '♟️', '🎭', '🎤', '💃',
  '🧗', '⛷️', '🏄', '🎣', '🏕️', '🛹', '🚗', '🐾'
];

const SKILL_LEVEL_CLASS = {
  Beginner: 'chipBeginner',
  Intermediate: 'chipIntermediate',
  Advanced: 'chipAdvanced',
  Expert: 'chipExpert'
};

let nextId = 1;
function uid() { return nextId++; }

function makeEntry(fields) {
  return { id: uid(), ...fields };
}

const INITIAL_DATA = {
  personal: {
    fullName: '',
    jobTitle: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    educationLevel: '',
    summary: '',
    photo: ''
  },
  experience: [makeEntry({ jobTitle: '', company: '', from: '', to: '', current: false, description: '' })],
  skills: [],
  education: [makeEntry({ degree: '', institution: '', field: '', grade: '', from: '', to: '' })],
  hobbies: []
};

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}

function buildCvHtml(data) {
  const { personal, experience, skills, education, hobbies } = data;
  const initials = getInitials(personal.fullName);
  const photoHtml = personal.photo
    ? `<img src="${personal.photo}" alt="${escapeHtml(personal.fullName)}" />`
    : initials;

  const contactItems = [];
  if (personal.phone) contactItems.push(`<span>📞 ${escapeHtml(personal.phone)}</span>`);
  if (personal.email) contactItems.push(`<span>✉️ ${escapeHtml(personal.email)}</span>`);
  if (personal.address) contactItems.push(`<span>📍 ${escapeHtml(personal.address)}</span>`);
  if (personal.website) contactItems.push(`<span>🔗 ${escapeHtml(personal.website)}</span>`);

  const summaryHtml = personal.summary
    ? `<section class="cv-s"><h2>Summary</h2><p>${escapeHtml(personal.summary)}</p></section>`
    : '';

  const expHtml = experience.filter(e => e.jobTitle || e.company).length > 0
    ? `<section class="cv-s"><h2>Experience</h2>${experience.filter(e => e.jobTitle || e.company).map(e => {
        const dates = `${escapeHtml(e.from || '')} – ${e.current ? 'Present' : escapeHtml(e.to || '')}`;
        return `<div class="cv-i">
          <div class="cv-ih">
            <div><span class="cv-t">${escapeHtml(e.jobTitle)}</span>${e.company ? ` <span class="cv-c">at ${escapeHtml(e.company)}</span>` : ''}</div>
            <div class="cv-d">${dates}</div>
          </div>
          ${e.description ? `<p class="cv-de">${escapeHtml(e.description)}</p>` : ''}
        </div>`;
      }).join('')}</section>`
    : '';

  const eduHtml = education.filter(e => e.degree || e.institution).length > 0
    ? `<section class="cv-s"><h2>Education</h2>${education.filter(e => e.degree || e.institution).map(e => {
        const dates = `${escapeHtml(e.from || '')} – ${escapeHtml(e.to || '')}`;
        return `<div class="cv-i">
          <div class="cv-ih">
            <div><span class="cv-t">${escapeHtml(e.degree)}${e.field ? `, ${escapeHtml(e.field)}` : ''}</span></div>
            <div class="cv-d">${dates}</div>
          </div>
          ${e.institution ? `<div class="cv-c">${escapeHtml(e.institution)}</div>` : ''}
          ${e.grade ? `<p class="cv-de">Grade: ${escapeHtml(e.grade)}</p>` : ''}
        </div>`;
      }).join('')}</section>`
    : '';

  const skillsHtml = skills.length > 0
    ? `<section class="cv-s"><h2>Skills</h2>${skills.map(s => {
        const level = SKILL_LEVELS.find(l => l.id === s.level) || SKILL_LEVELS[0];
        return `<div class="cv-sk">
          <div class="cv-sh"><span>${escapeHtml(s.name)}</span><span style="color:${level.color}">${level.id}</span></div>
          <div class="cv-sb"><div class="cv-sbf" style="width:${level.value}%;background:${level.color}"></div></div>
        </div>`;
      }).join('')}</section>`
    : '';

  const hobbiesHtml = hobbies.length > 0
    ? `<section class="cv-s"><h2>Hobbies & Interests</h2><div>${hobbies.map(h =>
        `<span class="cv-h">${escapeHtml(h.emoji || '⭐')} ${escapeHtml(h.name)}</span>`
      ).join('')}</div></section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>CV — ${escapeHtml(personal.fullName || 'Resume')}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; background: #fff; padding: 20px; }
.cv { max-width: 850px; margin: 0 auto; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.cv-h { background: linear-gradient(135deg, #0f2a47 0%, #1e3a5f 100%); color: #fff; padding: 36px 40px; display: flex; gap: 28px; align-items: center; }
.cv-p { width: 130px; height: 130px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 2.5rem; overflow: hidden; flex-shrink: 0; border: 4px solid rgba(255,255,255,0.2); }
.cv-p img { width: 100%; height: 100%; object-fit: cover; }
.cv-hi { flex: 1; }
.cv-n { font-size: 2rem; font-weight: 700; line-height: 1.1; margin-bottom: 4px; }
.cv-j { font-size: 1.1rem; color: #93c5fd; margin-bottom: 14px; }
.cv-c { display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 0.85rem; color: #cbd5e1; }
.cv-c span { display: inline-block; }
.cv-b { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; padding: 32px 40px; }
.cv-s { margin-bottom: 24px; }
.cv-s h2 { font-size: 1.05rem; font-weight: 700; color: #0f2a47; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: 12px; display: inline-block; }
.cv-s p { font-size: 0.92rem; line-height: 1.6; color: #374151; }
.cv-i { margin-bottom: 16px; }
.cv-ih { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
.cv-t { font-weight: 700; color: #1f2937; font-size: 0.95rem; }
.cv-c { color: #2563eb; font-size: 0.88rem; font-weight: 500; }
.cv-d { color: #6b7280; font-size: 0.8rem; font-style: italic; }
.cv-de { font-size: 0.85rem; line-height: 1.55; color: #4b5563; margin-top: 6px; white-space: pre-wrap; }
.cv-sk { margin-bottom: 12px; }
.cv-sh { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
.cv-sb { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.cv-sbf { height: 100%; border-radius: 4px; }
.cv-h { display: inline-block; padding: 6px 12px; margin: 0 6px 6px 0; background: #f3f4f6; border-radius: 999px; font-size: 0.82rem; color: #1f2937; }
@media print { body { padding: 0; } .cv { box-shadow: none; } }
</style></head>
<body>
<div class="cv">
  <div class="cv-h">
    <div class="cv-p">${photoHtml}</div>
    <div class="cv-hi">
      <div class="cv-n">${escapeHtml(personal.fullName || 'Your Name')}</div>
      <div class="cv-j">${escapeHtml(personal.jobTitle || 'Professional Title')}</div>
      <div class="cv-c">${contactItems.join('')}</div>
    </div>
  </div>
  <div class="cv-b">
    <div>
      ${summaryHtml}
      ${expHtml}
      ${eduHtml}
    </div>
    <div>
      ${skillsHtml}
      ${hobbiesHtml}
    </div>
  </div>
</div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export default function CVGeneratorClient() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const [photoDragging, setPhotoDragging] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef(null);

  const updatePersonal = (field, value) => {
    setData(d => ({ ...d, personal: { ...d.personal, [field]: value } }));
  };

  const addExperience = () => {
    setData(d => ({ ...d, experience: [...d.experience, makeEntry({ jobTitle: '', company: '', from: '', to: '', current: false, description: '' })] }));
  };

  const updateExperience = (id, field, value) => {
    setData(d => ({
      ...d,
      experience: d.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeExperience = (id) => {
    setData(d => ({ ...d, experience: d.experience.length > 1 ? d.experience.filter(e => e.id !== id) : d.experience }));
  };

  const addSkill = () => {
    setData(d => ({ ...d, skills: [...d.skills, makeEntry({ name: '', level: 'Intermediate' })] }));
  };

  const updateSkill = (id, field, value) => {
    setData(d => ({
      ...d,
      skills: d.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSkill = (id) => {
    setData(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) }));
  };

  const addEducation = () => {
    setData(d => ({ ...d, education: [...d.education, makeEntry({ degree: '', institution: '', field: '', grade: '', from: '', to: '' })] }));
  };

  const updateEducation = (id, field, value) => {
    setData(d => ({
      ...d,
      education: d.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id) => {
    setData(d => ({ ...d, education: d.education.length > 1 ? d.education.filter(e => e.id !== id) : d.education }));
  };

  const addHobby = () => {
    setData(d => ({ ...d, hobbies: [...d.hobbies, makeEntry({ name: '', emoji: '⭐' })] }));
  };

  const updateHobby = (id, field, value) => {
    setData(d => ({
      ...d,
      hobbies: d.hobbies.map(h => h.id === id ? { ...h, [field]: value } : h)
    }));
  };

  const removeHobby = (id) => {
    setData(d => ({ ...d, hobbies: d.hobbies.filter(h => h.id !== id) }));
  };

  const handlePhotoFiles = useCallback(async (files) => {
    setError('');
    const file = files && files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      updatePersonal('photo', dataUrl);
    } catch {
      setError('Failed to read image.');
    }
  }, []);

  const onPhotoDrop = (e) => {
    e.preventDefault();
    setPhotoDragging(false);
    handlePhotoFiles(e.dataTransfer.files);
  };

  const onPhotoInput = (e) => {
    if (e.target.files) handlePhotoFiles(e.target.files);
    e.target.value = '';
  };

  const removePhoto = () => updatePersonal('photo', '');

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!data.personal.fullName.trim()) {
        setError('Please enter your full name.');
        return false;
      }
    }
    return true;
  };

  const goNext = () => { if (validateStep()) setStep(s => Math.min(STEPS.length, s + 1)); };
  const goBack = () => { setError(''); setStep(s => Math.max(1, s - 1)); };

  const downloadWord = () => {
    const html = buildCvHtml(data);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV-${(data.personal.fullName || 'resume').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const html = buildCvHtml(data);
    const w = window.open('', '_blank');
    if (!w) { setError('Pop-up blocked. Please allow pop-ups to download PDF.'); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      setTimeout(() => {
        try { w.focus(); w.print(); } catch {}
      }, 300);
    };
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>AI CV Generator</h1>
          <p className={styles.subtitle}>Build a professional CV in minutes — export to PDF &amp; Word</p>
        </header>

        <div className={styles.steps} role="tablist" aria-label="CV builder steps">
          {STEPS.map(s => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            const className = `${styles.stepBadge} ${isActive ? styles.stepBadgeActive : ''} ${isDone ? styles.stepBadgeDone : ''}`;
            return (
              <button
                key={s.id}
                type="button"
                className={className}
                onClick={() => setStep(s.id)}
                aria-selected={isActive}
                role="tab"
              >
                <span className={styles.stepNumber}>{isDone ? '✓' : s.id}</span>
                <span aria-hidden="true">{s.icon}</span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className={styles.card} style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>⚠️ {error}</div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Personal Information</h2>
            <p className={styles.cardDesc}>Tell us about yourself. This will appear at the top of your CV.</p>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name *</label>
                <input className={styles.input} value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} placeholder="John Doe" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Job Title</label>
                <input className={styles.input} value={data.personal.jobTitle} onChange={e => updatePersonal('jobTitle', e.target.value)} placeholder="Software Engineer" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} type="tel" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="+1 234 567 8900" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="john@example.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Address</label>
                <input className={styles.input} value={data.personal.address} onChange={e => updatePersonal('address', e.target.value)} placeholder="San Francisco, CA" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Website / LinkedIn</label>
                <input className={styles.input} value={data.personal.website} onChange={e => updatePersonal('website', e.target.value)} placeholder="https://linkedin.com/in/johndoe" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Education Level</label>
                <select className={styles.select} value={data.personal.educationLevel} onChange={e => updatePersonal('educationLevel', e.target.value)}>
                  <option value="">Select education level…</option>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Professional Summary</label>
                <textarea className={styles.textarea} value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} placeholder="A short, 2–3 sentence pitch about who you are and what you do best…" rows={4} />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Profile Photo (optional)</label>
                {data.personal.photo ? (
                  <div className={styles.avatarPreview}>
                    <div className={styles.avatar}><img src={data.personal.photo} alt="Profile" /></div>
                    <div className={styles.avatarInfo}>
                      <div className={styles.avatarName}>{getInitials(data.personal.fullName) || 'Photo'}</div>
                      <div className={styles.avatarMeta}>Image uploaded</div>
                    </div>
                    <button type="button" className={styles.avatarRemove} onClick={removePhoto}>Remove</button>
                  </div>
                ) : (
                  <div
                    className={`${styles.dropzone} ${photoDragging ? styles.dropzoneDragging : ''}`}
                    onClick={() => photoInputRef.current?.click()}
                    onDrop={onPhotoDrop}
                    onDragOver={e => { e.preventDefault(); setPhotoDragging(true); }}
                    onDragLeave={() => setPhotoDragging(false)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.dropzoneIcon} aria-hidden="true">📷</div>
                    <div className={styles.dropzoneText}>Drag &amp; drop your photo here</div>
                    <div className={styles.dropzoneHint}>or click to browse — PNG, JPG, WEBP (max 5 MB)</div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={onPhotoInput}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.navRow}>
              <span />
              <button type="button" className={styles.btnPrimary} onClick={goNext}>Next: Experience →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Work Experience</h2>
            <p className={styles.cardDesc}>Add your most relevant roles. Start with the most recent.</p>

            {data.experience.map((e, idx) => (
              <div key={e.id} className={styles.entryCard}>
                <div className={styles.entryHeader}>
                  <div className={styles.entryTitle}>Experience {idx + 1}</div>
                  {data.experience.length > 1 && (
                    <button type="button" className={styles.removeBtn} onClick={() => removeExperience(e.id)}>Remove</button>
                  )}
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Job Title</label>
                    <input className={styles.input} value={e.jobTitle} onChange={ev => updateExperience(e.id, 'jobTitle', ev.target.value)} placeholder="Senior Developer" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Company</label>
                    <input className={styles.input} value={e.company} onChange={ev => updateExperience(e.id, 'company', ev.target.value)} placeholder="Acme Inc." />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>From</label>
                    <input className={styles.input} type="month" value={e.from} onChange={ev => updateExperience(e.id, 'from', ev.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>To</label>
                    <input className={styles.input} type="month" value={e.to} onChange={ev => updateExperience(e.id, 'to', ev.target.value)} disabled={e.current} placeholder={e.current ? 'Present' : ''} />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.checkboxRow}>
                      <input type="checkbox" checked={e.current} onChange={ev => updateExperience(e.id, 'current', ev.target.checked)} />
                      Currently working here
                    </label>
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} value={e.description} onChange={ev => updateExperience(e.id, 'description', ev.target.value)} placeholder="Key responsibilities, achievements, technologies used…" rows={3} />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className={styles.addBtn} onClick={addExperience}>+ Add Another Experience</button>

            <div className={styles.navRow} style={{ marginTop: 20 }}>
              <button type="button" className={styles.btnSecondary} onClick={goBack}>← Back</button>
              <button type="button" className={styles.btnPrimary} onClick={goNext}>Next: Skills →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Skills</h2>
            <p className={styles.cardDesc}>Add skills you want to highlight. Each one gets a level and a colored progress bar.</p>

            {data.skills.length === 0 ? (
              <div className={styles.empty}>No skills yet. Add your first one below.</div>
            ) : (
              data.skills.map(s => (
                <div key={s.id}>
                  <div className={styles.skillRow}>
                    <input
                      className={styles.input}
                      value={s.name}
                      onChange={e => updateSkill(s.id, 'name', e.target.value)}
                      placeholder="e.g. React, Public Speaking, Photoshop"
                    />
                    <select
                      className={styles.select}
                      value={s.level}
                      onChange={e => updateSkill(s.id, 'level', e.target.value)}
                    >
                      {SKILL_LEVELS.map(l => <option key={l.id} value={l.id}>{l.id}</option>)}
                    </select>
                    <button type="button" className={styles.removeBtn} onClick={() => removeSkill(s.id)} aria-label="Remove skill">✕</button>
                  </div>
                </div>
              ))
            )}

            <button type="button" className={styles.addBtn} onClick={addSkill}>+ Add Skill</button>

            {data.skills.length > 0 && (
              <div className={styles.chipsWrap}>
                {data.skills.filter(s => s.name).map(s => {
                  const level = SKILL_LEVELS.find(l => l.id === s.level) || SKILL_LEVELS[0];
                  const cls = SKILL_LEVEL_CLASS[s.level] || SKILL_LEVEL_CLASS.Beginner;
                  return (
                    <div key={s.id} className={`${styles.chip} ${styles[cls]}`}>
                      <span>{s.name}</span>
                      <span className={styles.chipBar}>
                        <span className={styles.chipBarFill} style={{ width: `${level.value}%` }} />
                      </span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{s.level}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.navRow} style={{ marginTop: 20 }}>
              <button type="button" className={styles.btnSecondary} onClick={goBack}>← Back</button>
              <button type="button" className={styles.btnPrimary} onClick={goNext}>Next: Education →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Education</h2>
            <p className={styles.cardDesc}>Add your degrees, diplomas, or certificates.</p>

            {data.education.map((e, idx) => (
              <div key={e.id} className={styles.entryCard}>
                <div className={styles.entryHeader}>
                  <div className={styles.entryTitle}>Education {idx + 1}</div>
                  {data.education.length > 1 && (
                    <button type="button" className={styles.removeBtn} onClick={() => removeEducation(e.id)}>Remove</button>
                  )}
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Degree</label>
                    <input className={styles.input} value={e.degree} onChange={ev => updateEducation(e.id, 'degree', ev.target.value)} placeholder="Bachelor of Science" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Field of Study</label>
                    <input className={styles.input} value={e.field} onChange={ev => updateEducation(e.id, 'field', ev.target.value)} placeholder="Computer Science" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Institution</label>
                    <input className={styles.input} value={e.institution} onChange={ev => updateEducation(e.id, 'institution', ev.target.value)} placeholder="Stanford University" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Grade / GPA</label>
                    <input className={styles.input} value={e.grade} onChange={ev => updateEducation(e.id, 'grade', ev.target.value)} placeholder="3.8 / 4.0" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>&nbsp;</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input className={styles.input} type="month" value={e.from} onChange={ev => updateEducation(e.id, 'from', ev.target.value)} />
                      <input className={styles.input} type="month" value={e.to} onChange={ev => updateEducation(e.id, 'to', ev.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className={styles.addBtn} onClick={addEducation}>+ Add Another Education</button>

            <div className={styles.navRow} style={{ marginTop: 20 }}>
              <button type="button" className={styles.btnSecondary} onClick={goBack}>← Back</button>
              <button type="button" className={styles.btnPrimary} onClick={goNext}>Next: Hobbies →</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Hobbies &amp; Interests</h2>
            <p className={styles.cardDesc}>Add a personal touch with hobbies. Each one can have its own emoji icon.</p>

            {data.hobbies.length === 0 ? (
              <div className={styles.empty}>No hobbies yet. Add one below to get started.</div>
            ) : (
              data.hobbies.map(h => (
                <div key={h.id} style={{ marginBottom: 14 }}>
                  <div className={styles.skillRow}>
                    <input
                      className={styles.input}
                      value={h.name}
                      onChange={e => updateHobby(h.id, 'name', e.target.value)}
                      placeholder="e.g. Photography, Chess, Hiking"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', background: '#0a0a14', border: '1px solid #2d2d4e', borderRadius: 8, fontSize: '1.2rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{h.emoji || '⭐'}</span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>pick below</span>
                    </div>
                    <button type="button" className={styles.removeBtn} onClick={() => removeHobby(h.id)} aria-label="Remove hobby">✕</button>
                  </div>
                  <div className={styles.iconPicker}>
                    {HOBBY_EMOJIS.map(em => (
                      <button
                        key={em}
                        type="button"
                        className={`${styles.iconBtn} ${h.emoji === em ? styles.iconBtnActive : ''}`}
                        onClick={() => updateHobby(h.id, 'emoji', em)}
                        aria-label={`Pick ${em}`}
                      >{em}</button>
                    ))}
                  </div>
                </div>
              ))
            )}

            <button type="button" className={styles.addBtn} onClick={addHobby}>+ Add Hobby</button>

            <div className={styles.navRow} style={{ marginTop: 20 }}>
              <button type="button" className={styles.btnSecondary} onClick={goBack}>← Back</button>
              <button type="button" className={styles.btnPrimary} onClick={goNext}>Generate CV ✨</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <div className={styles.actionBar} style={{ marginBottom: 20 }}>
              <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>✏️ Edit</button>
              <button type="button" className={styles.btnSecondary} onClick={downloadWord}>📄 Download Word</button>
              <button type="button" className={styles.btnPrimary} onClick={downloadPdf}>📑 Download PDF</button>
            </div>

            <CvPreview data={data} />
          </div>
        )}
      </div>
    </div>
  );
}

function CvPreview({ data }) {
  const { personal, experience, skills, education, hobbies } = data;
  const initials = getInitials(personal.fullName);

  return (
    <div className={styles.cvWrapper} aria-label="CV preview">
      <div className={styles.cvHeader}>
        <div className={styles.cvPhoto}>
          {personal.photo ? <img src={personal.photo} alt={personal.fullName} /> : initials}
        </div>
        <div className={styles.cvHeaderInfo}>
          <h1 className={styles.cvName}>{personal.fullName || 'Your Name'}</h1>
          <div className={styles.cvJobTitle}>{personal.jobTitle || 'Professional Title'}</div>
          <div className={styles.cvContacts}>
            {personal.phone && <span className={styles.cvContactItem}>📞 {personal.phone}</span>}
            {personal.email && <span className={styles.cvContactItem}>✉️ {personal.email}</span>}
            {personal.address && <span className={styles.cvContactItem}>📍 {personal.address}</span>}
            {personal.website && <span className={styles.cvContactItem}>🔗 {personal.website}</span>}
          </div>
        </div>
      </div>
      <div className={styles.cvBody}>
        <div>
          {personal.summary && (
            <div className={styles.cvSection}>
              <h2 className={styles.cvSectionTitle}>Summary</h2>
              <p className={styles.cvSummary}>{personal.summary}</p>
            </div>
          )}
          {experience.some(e => e.jobTitle || e.company) && (
            <div className={styles.cvSection}>
              <h2 className={styles.cvSectionTitle}>Experience</h2>
              {experience.filter(e => e.jobTitle || e.company).map(e => (
                <div key={e.id} className={styles.cvItem}>
                  <div className={styles.cvItemHeader}>
                    <div>
                      <span className={styles.cvItemTitle}>{e.jobTitle}</span>
                      {e.company && <span className={styles.cvItemCompany}> at {e.company}</span>}
                    </div>
                    <div className={styles.cvItemDate}>{e.from} – {e.current ? 'Present' : e.to}</div>
                  </div>
                  {e.description && <p className={styles.cvItemDesc}>{e.description}</p>}
                </div>
              ))}
            </div>
          )}
          {education.some(e => e.degree || e.institution) && (
            <div className={styles.cvSection}>
              <h2 className={styles.cvSectionTitle}>Education</h2>
              {education.filter(e => e.degree || e.institution).map(e => (
                <div key={e.id} className={styles.cvItem}>
                  <div className={styles.cvItemHeader}>
                    <div>
                      <span className={styles.cvItemTitle}>{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                    </div>
                    <div className={styles.cvItemDate}>{e.from} – {e.to}</div>
                  </div>
                  {e.institution && <div className={styles.cvItemCompany}>{e.institution}</div>}
                  {e.grade && <p className={styles.cvItemDesc}>Grade: {e.grade}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {skills.length > 0 && (
            <div className={styles.cvSection}>
              <h2 className={styles.cvSectionTitle}>Skills</h2>
              {skills.map(s => {
                const level = SKILL_LEVELS.find(l => l.id === s.level) || SKILL_LEVELS[0];
                return (
                  <div key={s.id} className={styles.cvSkill}>
                    <div className={styles.cvSkillHeader}>
                      <span>{s.name}</span>
                      <span style={{ color: level.color }}>{s.level}</span>
                    </div>
                    <div className={styles.cvSkillBar}>
                      <div className={styles.cvSkillBarFill} style={{ width: `${level.value}%`, background: level.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {hobbies.length > 0 && (
            <div className={styles.cvSection}>
              <h2 className={styles.cvSectionTitle}>Hobbies &amp; Interests</h2>
              <div>
                {hobbies.map(h => (
                  <span key={h.id} className={styles.cvHobby}>{h.emoji || '⭐'} {h.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

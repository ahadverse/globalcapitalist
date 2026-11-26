'use client';

import { useState } from 'react';
import { API_URL } from '../lib/posts';

export default function ContactForm({ content }) {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setFeedback({ type: '', message: '' });
    setBusy(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || content.networkErrorMessage);
      }

      setValues({ name: '', email: '', subject: '', message: '' });
      setFeedback({ type: 'success', message: content.successMessage });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof TypeError ? content.networkErrorMessage : error.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="row gy-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="contact-name">{content.nameLabel}</label>
          <input className="form-control" id="contact-name" name="name" value={values.name} onChange={updateField} maxLength={100} placeholder={content.namePlaceholder} required />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="contact-email">{content.emailLabel}</label>
          <input className="form-control" id="contact-email" name="email" type="email" value={values.email} onChange={updateField} maxLength={254} placeholder={content.emailPlaceholder} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="contact-subject">{content.subjectLabel}</label>
          <input className="form-control" id="contact-subject" name="subject" value={values.subject} onChange={updateField} maxLength={150} placeholder={content.subjectPlaceholder} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="contact-message">{content.messageLabel}</label>
          <textarea className="form-control" id="contact-message" name="message" value={values.message} onChange={updateField} maxLength={5000} rows={7} placeholder={content.messagePlaceholder} required />
        </div>
        <div className="col-12 d-flex flex-column align-items-start gap-3">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? content.submittingLabel : content.submitLabel}
          </button>
          {feedback.message && (
            <p className={`contact-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

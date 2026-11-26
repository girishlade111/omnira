'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { ChamferedButton, ChamferedPanel } from '@/components/primitives';
import { contactContent } from '@/content/contact';
import { validateContactSubmission } from '@/lib/contact-validation';
import { TechnicalSelect } from './TechnicalSelect';
import styles from './contact.module.css';

interface FormState {
  name: string;
  email: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  details: string;
  website: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

interface SubmitFeedback {
  type: 'success' | 'error';
  message: string;
  mode?: 'demo' | 'webhook';
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  projectType: '',
  budgetRange: '',
  timeline: '',
  details: '',
  website: '',
};

export function ProjectInquiryForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<SubmitFeedback | null>(null);

  const updateField = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setFeedback(null);
    const parsed = validateContactSubmission({
      name: form.name,
      email: form.email,
      projectType: form.projectType,
      budgetRange: form.budgetRange,
      timeline: form.timeline,
      details: form.details,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const [k, messages] of Object.entries(parsed.fieldErrors)) {
        if (messages.length > 0) {
          nextErrors[k as keyof FormState] = messages[0];
        }
      }
      setFieldErrors(nextErrors);
      setFeedback({
        type: 'error',
        message: parsed.error,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          website: form.website,
        }),
      });

      const payload = (await res.json()) as {
        ok?: boolean;
        mode?: 'demo' | 'webhook';
        message?: string;
        fieldErrors?: Record<string, string[]>;
      };

      if (!res.ok || !payload.ok) {
        if (payload.fieldErrors) {
          const serverErrors: FieldErrors = {};
          for (const [k, msgs] of Object.entries(payload.fieldErrors)) {
            if (msgs?.[0]) serverErrors[k as keyof FormState] = msgs[0];
          }
          setFieldErrors(serverErrors);
        }
        setFeedback({
          type: 'error',
          message: payload.message || 'Unable to submit inquiry right now. Please try again.',
        });
        return;
      }

      setFieldErrors({});
      setForm(INITIAL_FORM);
      setFeedback({
        type: 'success',
        mode: payload.mode,
        message:
          payload.message ||
          'Request validated and recorded in local demonstration mode.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Network error while submitting request. Your entered details were preserved.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChamferedPanel
      cornerCut={12}
      borderColor="rgba(255, 255, 255, 0.14)"
      backgroundColor="#0d0d0d"
      showGrain
      grainOpacity={0.65}
      className={styles.formPanel}
      innerClassName={styles.formPanelInner}
    >
      <form
        id="contact-form"
        onSubmit={handleSubmit}
        noValidate
        className={styles.formRoot}
        aria-label="Project inquiry form"
      >
        <div className={styles.honeypotField} aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="contact-name" className={styles.fieldLabel}>
            YOUR NAME
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
            className={`${styles.textInput} ${fieldErrors.name ? styles.inputError : ''}`.trim()}
          />
          {fieldErrors.name ? (
            <p id="contact-name-error" className={styles.fieldError}>
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="contact-email" className={styles.fieldLabel}>
            EMAIL ADDRESS
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
            className={`${styles.textInput} ${fieldErrors.email ? styles.inputError : ''}`.trim()}
          />
          {fieldErrors.email ? (
            <p id="contact-email-error" className={styles.fieldError}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <TechnicalSelect
          id="contact-project-type"
          label="PROJECT TYPE"
          placeholder="Select..."
          value={form.projectType}
          options={contactContent.selectOptions.projectType}
          required
          error={fieldErrors.projectType}
          onChange={(val) => updateField('projectType', val)}
        />

        <div className={styles.twoColFields}>
          <TechnicalSelect
            id="contact-budget-range"
            label="BUDGET RANGE"
            placeholder="Select"
            value={form.budgetRange}
            options={contactContent.selectOptions.budgetRange}
            required
            error={fieldErrors.budgetRange}
            onChange={(val) => updateField('budgetRange', val)}
          />

          <TechnicalSelect
            id="contact-timeline"
            label="TIMELINE"
            placeholder="Select..."
            value={form.timeline}
            options={contactContent.selectOptions.timeline}
            required
            error={fieldErrors.timeline}
            onChange={(val) => updateField('timeline', val)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="contact-details" className={styles.fieldLabel}>
            PROJECT DETAILS
          </label>
          <textarea
            id="contact-details"
            name="details"
            rows={4}
            maxLength={4000}
            placeholder="Tell me about your project, goals, and any details."
            value={form.details}
            onChange={(e) => updateField('details', e.target.value)}
            aria-invalid={Boolean(fieldErrors.details)}
            aria-describedby={fieldErrors.details ? 'contact-details-error' : undefined}
            className={`${styles.textareaInput} ${fieldErrors.details ? styles.inputError : ''}`.trim()}
          />
          {fieldErrors.details ? (
            <p id="contact-details-error" className={styles.fieldError}>
              {fieldErrors.details}
            </p>
          ) : null}
        </div>

        <ChamferedButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={submitting}
          ariaLabel={submitting ? 'Sending request' : contactContent.submitLabel}
        >
          {submitting ? 'SENDING REQUEST...' : contactContent.submitLabel}
        </ChamferedButton>

        <div aria-live="polite" className={styles.feedbackRegion}>
          {feedback ? (
            <div
              role="status"
              className={`${styles.feedbackBox} ${
                feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
              }`.trim()}
            >
              <p className={styles.feedbackText}>{feedback.message}</p>
              {feedback.mode === 'demo' ? (
                <p className={styles.feedbackMeta}>
                  LOCAL DEMO MODE: No external email was sent.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    </ChamferedPanel>
  );
}

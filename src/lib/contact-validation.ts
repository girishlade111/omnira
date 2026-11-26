import { z } from 'zod';
import { contactContent } from '@/content/contact';

function extractValues(options: { value: string }[]): [string, ...string[]] {
  const values = options.map((opt) => opt.value);
  if (values.length === 0) {
    throw new Error('Select options must contain at least one value.');
  }
  return values as [string, ...string[]];
}

export const PROJECT_TYPE_VALUES = extractValues(contactContent.selectOptions.projectType);
export const BUDGET_RANGE_VALUES = extractValues(contactContent.selectOptions.budgetRange);
export const TIMELINE_VALUES = extractValues(contactContent.selectOptions.timeline);

export const HONEYPOT_FIELD_NAMES = [
  'website',
  'company',
  'subject',
  'title',
  'feedback',
  'notes',
  'remarks',
  'comments',
] as const;

export const contactSubmissionSchema = z.object({
  name: z
    .string({ message: 'Name is required.' })
    .trim()
    .min(2, 'Please enter at least 2 characters.')
    .max(120, 'Name must be 120 characters or fewer.'),
  email: z
    .string({ message: 'Email address is required.' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(254, 'Email address must be 254 characters or fewer.'),
  projectType: z.enum(PROJECT_TYPE_VALUES, {
    message: 'Please select a valid project type.',
  }),
  budgetRange: z.enum(BUDGET_RANGE_VALUES, {
    message: 'Please select a valid budget range.',
  }),
  timeline: z.enum(TIMELINE_VALUES, {
    message: 'Please select a valid timeline.',
  }),
  // Live Framer form leaves textarea HTML `required` false; keep optional with max length 4000.
  details: z
    .string()
    .trim()
    .max(4000, 'Project details must be 4000 characters or fewer.')
    .optional()
    .default(''),
  website: z.string().optional(),
  company: z.string().optional(),
});

export type ContactSubmissionInput = z.input<typeof contactSubmissionSchema>;
export type ContactSubmissionData = z.output<typeof contactSubmissionSchema>;

export type ContactValidationResult =
  | {
      success: true;
      data: ContactSubmissionData;
    }
  | {
      success: false;
      error: string;
      fieldErrors: Record<string, string[]>;
    };

/**
 * Checks whether any hidden anti-spam honeypot field was populated.
 */
export function hasHoneypotTrip(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const record = payload as Record<string, unknown>;
  for (const field of HONEYPOT_FIELD_NAMES) {
    const value = record[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Validates and normalizes a contact form submission payload using Zod.
 */
export function validateContactSubmission(payload: unknown): ContactValidationResult {
  const parsed = contactSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[key] = messages;
      }
    }
    return {
      success: false,
      error: 'Please review the highlighted form fields.',
      fieldErrors,
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

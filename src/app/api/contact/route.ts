import { NextResponse } from 'next/server';
import { hasHoneypotTrip, validateContactSubmission } from '@/lib/contact-validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function buildRateLimitHeaders(rateLimit: {
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(rateLimit.limit),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
  };
  if (rateLimit.retryAfterSeconds > 0) {
    headers['Retry-After'] = String(rateLimit.retryAfterSeconds);
  }
  return headers;
}

function isRealDeliveryAllowed(): boolean {
  return process.env.CONTACT_FORM_MODE !== 'demo';
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON.',
      },
      { status: 400 }
    );
  }

  if (hasHoneypotTrip(payload)) {
    return NextResponse.json(
      {
        ok: false,
        code: 'SPAM_DETECTED',
        message: 'Submission rejected by spam filter.',
      },
      { status: 400 }
    );
  }

  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`contact:${clientIp}`);
  const rateHeaders = buildRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait before submitting again.',
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      { status: 429, headers: rateHeaders }
    );
  }

  const validation = validateContactSubmission(payload);
  if (!validation.success) {
    return NextResponse.json(
      {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: validation.error,
        fieldErrors: validation.fieldErrors,
      },
      { status: 400, headers: rateHeaders }
    );
  }

  const submission = validation.data;
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim();

  if (isRealDeliveryAllowed() && webhookUrl) {
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'omnira-contact-form',
          submittedAt: new Date().toISOString(),
          name: submission.name,
          email: submission.email,
          projectType: submission.projectType,
          budgetRange: submission.budgetRange,
          timeline: submission.timeline,
          details: submission.details,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!webhookResponse.ok) {
        return NextResponse.json(
          {
            ok: false,
            code: 'DELIVERY_FAILED',
            message: 'Unable to deliver your request right now. Please try again later.',
          },
          { status: 502, headers: rateHeaders }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          mode: 'webhook',
          simulated: false,
          message: 'Your inquiry has been delivered successfully.',
        },
        { status: 200, headers: rateHeaders }
      );
    } catch {
      return NextResponse.json(
        {
          ok: false,
          code: 'DELIVERY_ERROR',
          message: 'Unable to deliver your request right now. Please try again later.',
        },
        { status: 502, headers: rateHeaders }
      );
    }
  }

  const smtpConfigured = Boolean(process.env.SMTP_HOST?.trim());
  const demoReason =
    smtpConfigured && isRealDeliveryAllowed()
      ? 'Demo fallback active: SMTP environment detected without an active webhook transport; request validated locally only.'
      : 'Demo mode: request validated locally. No live email was transmitted.';

  return NextResponse.json(
    {
      ok: true,
      mode: 'demo',
      simulated: true,
      message: demoReason,
      received: {
        name: submission.name,
        projectType: submission.projectType,
        budgetRange: submission.budgetRange,
        timeline: submission.timeline,
      },
    },
    { status: 200, headers: rateHeaders }
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Use POST to submit a contact request.',
    },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

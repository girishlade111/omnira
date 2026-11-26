import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/contact/route';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { hasHoneypotTrip, validateContactSubmission } from '@/lib/contact-validation';
import { checkRateLimit, getClientIp, resetRateLimitStore } from '@/lib/rate-limit';

function makePostRequest(body: unknown, ip = '203.0.113.10'): Request {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const VALID_PAYLOAD = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  projectType: 'design',
  budgetRange: '3k-5k',
  timeline: '2-4-weeks',
  details: 'Building a dark futuristic marketing site.',
};

describe('Contact validation & honeypot helpers', () => {
  it('accepts valid payloads and allows optional details', () => {
    const full = validateContactSubmission(VALID_PAYLOAD);
    expect(full.success).toBe(true);
    if (full.success) {
      expect(full.data.email).toBe('jane@example.com');
      expect(full.data.projectType).toBe('design');
    }

    const noDetails = validateContactSubmission({
      name: 'Jane Smith',
      email: 'JANE@EXAMPLE.COM',
      projectType: 'development',
      budgetRange: 'not-sure-yet',
      timeline: 'flexible',
    });
    expect(noDetails.success).toBe(true);
    if (noDetails.success) {
      expect(noDetails.data.email).toBe('jane@example.com');
      expect(noDetails.data.details).toBe('');
    }
  });

  it('rejects invalid name, email, enum options, and oversized details', () => {
    const res = validateContactSubmission({
      name: 'A',
      email: 'not-an-email',
      projectType: 'unknown-type',
      budgetRange: 'free',
      timeline: 'yesterday',
      details: 'x'.repeat(4001),
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.fieldErrors.name).toBeDefined();
      expect(res.fieldErrors.email).toBeDefined();
      expect(res.fieldErrors.projectType).toBeDefined();
      expect(res.fieldErrors.budgetRange).toBeDefined();
      expect(res.fieldErrors.timeline).toBeDefined();
      expect(res.fieldErrors.details).toBeDefined();
    }
  });

  it('detects populated honeypot fields and ignores empty ones', () => {
    expect(hasHoneypotTrip({ ...VALID_PAYLOAD, website: '' })).toBe(false);
    expect(hasHoneypotTrip({ ...VALID_PAYLOAD, company: '   ' })).toBe(false);
    expect(hasHoneypotTrip({ ...VALID_PAYLOAD, website: 'https://spam.invalid' })).toBe(true);
    expect(hasHoneypotTrip({ ...VALID_PAYLOAD, company: 'Bot Corp' })).toBe(true);
  });
});

describe('Sliding-window rate limiter', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('enforces maxRequests within the window and resets after expiry', () => {
    const t0 = 1_700_000_000_000;
    for (let i = 0; i < 5; i++) {
      const hit = checkRateLimit('ip:1', { windowMs: 60_000, maxRequests: 5, now: t0 + i * 100 });
      expect(hit.allowed).toBe(true);
      expect(hit.remaining).toBe(4 - i);
    }

    const blocked = checkRateLimit('ip:1', { windowMs: 60_000, maxRequests: 5, now: t0 + 1000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    const afterWindow = checkRateLimit('ip:1', {
      windowMs: 60_000,
      maxRequests: 5,
      now: t0 + 60_500,
    });
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(4);
  });

  it('extracts client IP cleanly from headers', () => {
    const req1 = new Request('http://localhost/api/contact', {
      headers: { 'x-forwarded-for': '198.51.100.2, 10.0.0.1' },
    });
    expect(getClientIp(req1)).toBe('198.51.100.2');

    const req2 = new Request('http://localhost/api/contact', {
      headers: { 'x-real-ip': '198.51.100.9' },
    });
    expect(getClientIp(req2)).toBe('198.51.100.9');

    const req3 = new Request('http://localhost/api/contact');
    expect(getClientIp(req3)).toBe('127.0.0.1');
  });
});

describe('/api/contact route handler', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetRateLimitStore();
    process.env = { ...originalEnv };
    delete process.env.CONTACT_WEBHOOK_URL;
    delete process.env.SMTP_HOST;
    process.env.CONTACT_FORM_MODE = 'demo';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('returns 200 demo simulation response for a valid submission', async () => {
    const res = await POST(makePostRequest(VALID_PAYLOAD));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4');

    const json = (await res.json()) as Record<string, unknown>;
    expect(json.ok).toBe(true);
    expect(json.mode).toBe('demo');
    expect(json.simulated).toBe(true);
  });

  it('returns 400 INVALID_JSON on malformed request body', async () => {
    const res = await POST(makePostRequest('{bad-json'));
    expect(res.status).toBe(400);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.ok).toBe(false);
    expect(json.code).toBe('INVALID_JSON');
  });

  it('returns 400 VALIDATION_ERROR with fieldErrors on invalid fields', async () => {
    const res = await POST(
      makePostRequest({
        ...VALID_PAYLOAD,
        email: 'bad-email',
        budgetRange: 'invalid-budget',
      })
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as {
      ok: boolean;
      code: string;
      fieldErrors: Record<string, string[]>;
    };
    expect(json.ok).toBe(false);
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.fieldErrors.email).toBeDefined();
    expect(json.fieldErrors.budgetRange).toBeDefined();
  });

  it('rejects honeypot spam submissions with 400 SPAM_DETECTED', async () => {
    const res = await POST(
      makePostRequest({
        ...VALID_PAYLOAD,
        website: 'https://spam-offer.invalid',
      })
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.ok).toBe(false);
    expect(json.code).toBe('SPAM_DETECTED');
  });

  it('returns 429 RATE_LIMITED after 5 requests from the same IP', async () => {
    const ip = '198.51.100.77';
    for (let i = 0; i < 5; i++) {
      const okRes = await POST(makePostRequest(VALID_PAYLOAD, ip));
      expect(okRes.status).toBe(200);
    }

    const blockedRes = await POST(makePostRequest(VALID_PAYLOAD, ip));
    expect(blockedRes.status).toBe(429);
    expect(Number(blockedRes.headers.get('Retry-After'))).toBeGreaterThan(0);

    const json = (await blockedRes.json()) as Record<string, unknown>;
    expect(json.ok).toBe(false);
    expect(json.code).toBe('RATE_LIMITED');
  });

  it('posts to webhook when configured outside demo mode', async () => {
    process.env.CONTACT_FORM_MODE = 'live';
    process.env.CONTACT_WEBHOOK_URL = 'https://hooks.example.invalid/contact';

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ received: true }), { status: 200 }));

    const res = await POST(makePostRequest(VALID_PAYLOAD, '198.51.100.88'));
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const json = (await res.json()) as Record<string, unknown>;
    expect(json.ok).toBe(true);
    expect(json.mode).toBe('webhook');
    expect(json.simulated).toBe(false);
  });

  it('returns 405 METHOD_NOT_ALLOWED on GET /api/contact', async () => {
    const res = await GET();
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.code).toBe('METHOD_NOT_ALLOWED');
  });
});

describe('SEO routes (sitemap & robots)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('emits core public routes in sitemap without /404', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toHaveLength(4);
    expect(urls.some((u) => u.endsWith('/about'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/works'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/contact'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/404'))).toBe(false);
  });

  it('allows indexing by default and disallows in demo or ROBOTS_DISALLOW mode', () => {
    delete process.env.ROBOTS_DISALLOW;
    delete process.env.CONTACT_FORM_MODE;
    const defaultRobots = robots();
    expect(defaultRobots.rules).toEqual({ userAgent: '*', allow: '/' });
    expect(defaultRobots.sitemap).toMatch(/\/sitemap\.xml$/);

    process.env.CONTACT_FORM_MODE = 'demo';
    const demoRobots = robots();
    expect(demoRobots.rules).toEqual({ userAgent: '*', disallow: '/' });

    delete process.env.CONTACT_FORM_MODE;
    process.env.ROBOTS_DISALLOW = 'true';
    const disallowRobots = robots();
    expect(disallowRobots.rules).toEqual({ userAgent: '*', disallow: '/' });
  });
});

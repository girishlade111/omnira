import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

interface DownloadEntry {
  id: string;
  url: string;
  baseUrl: string;
  category: string;
  localRelPath: string;
  assetKind: 'image' | 'svg' | 'font';
  description: string;
  usedIn: string[];
  originalOrReplacement: string;
  licenseStatus: string;
  licenseEvidence: string;
  httpStatus: number;
  contentType: string;
  byteSize: number;
  error: string | null;
  fontMeta?: {
    family: string;
    weight: string;
    style: string;
    unicodeRange: string;
    subsetLabel: string;
  };
}

export interface ValidatedAsset extends DownloadEntry {
  valid: boolean;
  validationErrors: string[];
  sha256: string | null;
  detectedFormat: string;
  magicBytesOk: boolean;
  sharpDecoded: boolean;
  intrinsicWidth: number | null;
  intrinsicHeight: number | null;
  hasAlpha: boolean | null;
  channels: number | null;
  svgValid: boolean | null;
  fontValid: boolean | null;
}

const ASSETS_SOURCE_DIR = path.resolve('assets-source/original');
const DOWNLOAD_MANIFEST = path.resolve('research/reference/assets/download-manifest.json');
const VALIDATION_REPORT = path.resolve('research/reference/assets/validation-report.json');

function detectMagicBytes(buf: Buffer): string {
  if (buf.length < 4) return 'too-short';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buf.subarray(0, 4).toString('ascii') === 'wOF2') return 'woff2';
  if (buf.subarray(0, 4).toString('ascii') === 'wOFF') return 'woff';
  if (buf.subarray(0, 4).toString('ascii') === 'OTTO') return 'otf';
  if (buf[0] === 0x00 && buf[1] === 0x01 && buf[2] === 0x00 && buf[3] === 0x00) return 'ttf';
  const headText = buf.subarray(0, Math.min(buf.length, 512)).toString('utf8').trimStart();
  if (/^(<\?xml[\s\S]*?)?<svg[\s>]/i.test(headText) || headText.includes('<svg')) return 'svg';
  if (/^<!doctype html|<html/i.test(headText)) return 'html-error';
  return 'unknown';
}

function validateSvgText(text: string): { valid: boolean; width: number | null; height: number | null; reason?: string } {
  const trimmed = text.trim();
  if (!trimmed.includes('<svg') || !trimmed.includes('</svg>')) {
    return { valid: false, width: null, height: null, reason: 'Missing <svg> or </svg> tags' };
  }
  if (/^<!doctype html|<html/i.test(trimmed)) {
    return { valid: false, width: null, height: null, reason: 'HTML document returned instead of SVG' };
  }
  const viewBox = trimmed.match(/viewBox=["']([^"']+)["']/i)?.[1];
  let w: number | null = null;
  let h: number | null = null;
  const wAttr = trimmed.match(/\bwidth=["'](\d+(?:\.\d+)?)(?:px)?["']/i)?.[1];
  const hAttr = trimmed.match(/\bheight=["'](\d+(?:\.\d+)?)(?:px)?["']/i)?.[1];
  if (wAttr) w = Math.round(Number(wAttr));
  if (hAttr) h = Math.round(Number(hAttr));
  if ((!w || !h) && viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      w = w || Math.round(parts[2]);
      h = h || Math.round(parts[3]);
    }
  }
  return { valid: true, width: w, height: h };
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(DOWNLOAD_MANIFEST, 'utf8'));
  const downloads = manifest.downloads as DownloadEntry[];
  const validated: ValidatedAsset[] = [];

  for (const item of downloads) {
    const fullPath = path.join(ASSETS_SOURCE_DIR, item.localRelPath);
    const errors: string[] = [];

    if (item.error) errors.push(`Download error: ${item.error}`);
    if (item.httpStatus < 200 || item.httpStatus >= 300) errors.push(`Non-2xx HTTP status: ${item.httpStatus}`);
    if (!fs.existsSync(fullPath)) {
      errors.push('File missing on disk');
      validated.push({
        ...item,
        valid: false,
        validationErrors: errors,
        sha256: null,
        detectedFormat: 'missing',
        magicBytesOk: false,
        sharpDecoded: false,
        intrinsicWidth: null,
        intrinsicHeight: null,
        hasAlpha: null,
        channels: null,
        svgValid: null,
        fontValid: null,
      });
      continue;
    }

    const buf = fs.readFileSync(fullPath);
    if (buf.length === 0) errors.push('Empty 0-byte file');
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    const detectedFormat = detectMagicBytes(buf);

    let magicBytesOk = false;
    let sharpDecoded = false;
    let intrinsicWidth: number | null = null;
    let intrinsicHeight: number | null = null;
    let hasAlpha: boolean | null = null;
    let channels: number | null = null;
    let svgValid: boolean | null = null;
    let fontValid: boolean | null = null;

    if (item.assetKind === 'font') {
      magicBytesOk = ['woff2', 'woff', 'ttf', 'otf'].includes(detectedFormat);
      fontValid = magicBytesOk && buf.length >= 100;
      if (!magicBytesOk) errors.push(`Invalid font magic bytes: ${detectedFormat}`);
    } else if (item.assetKind === 'svg') {
      magicBytesOk = detectedFormat === 'svg';
      const svgCheck = validateSvgText(buf.toString('utf8'));
      svgValid = svgCheck.valid;
      intrinsicWidth = svgCheck.width;
      intrinsicHeight = svgCheck.height;
      if (!svgCheck.valid) errors.push(svgCheck.reason || 'Invalid SVG');
    } else {
      magicBytesOk = ['png', 'jpeg', 'webp', 'gif'].includes(detectedFormat);
      if (!magicBytesOk) errors.push(`Unexpected raster magic bytes: ${detectedFormat}`);
      try {
        const meta = await sharp(buf).metadata();
        await sharp(buf).stats();
        sharpDecoded = true;
        intrinsicWidth = meta.width ?? null;
        intrinsicHeight = meta.height ?? null;
        hasAlpha = meta.hasAlpha ?? false;
        channels = meta.channels ?? null;
        if (!intrinsicWidth || !intrinsicHeight) errors.push('Zero or missing raster dimensions');
      } catch (err) {
        errors.push(`Sharp decode failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    validated.push({
      ...item,
      valid: errors.length === 0,
      validationErrors: errors,
      sha256,
      detectedFormat,
      magicBytesOk,
      sharpDecoded,
      intrinsicWidth,
      intrinsicHeight,
      hasAlpha,
      channels,
      svgValid,
      fontValid,
    });
  }

  const validCount = validated.filter((v) => v.valid).length;
  const invalidCount = validated.length - validCount;
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalChecked: validated.length,
      validCount,
      invalidCount,
    },
    assets: validated,
  };
  fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));
  console.log('Validation complete:', report.summary);
  if (invalidCount > 0) {
    for (const bad of validated.filter((v) => !v.valid)) {
      console.log('INVALID:', bad.localRelPath, bad.validationErrors);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

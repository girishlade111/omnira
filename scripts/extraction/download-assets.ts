import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

interface DownloadTarget {
  id: string;
  url: string;
  baseUrl: string;
  category: string;
  localRelPath: string;
  assetKind: 'image' | 'svg' | 'font';
  description: string;
  usedIn: string[];
  originalOrReplacement: 'reference_template_asset' | 'open_source_font' | 'framer_platform_asset';
  licenseStatus: string;
  licenseEvidence: string;
  fontMeta?: {
    family: string;
    weight: string;
    style: string;
    unicodeRange: string;
    subsetLabel: string;
  };
}

interface DownloadResult extends DownloadTarget {
  httpStatus: number;
  contentType: string;
  byteSize: number;
  downloadedAt: string;
  error: string | null;
}

const ASSETS_SOURCE_DIR = path.resolve('assets-source/original');
const REPORT_PATH = path.resolve('research/reference/assets/download-manifest.json');

const STATIC_IMAGE_MAP: Record<
  string,
  { category: string; filename: string; description: string; usedIn: string[]; licenseKind: 'template' | 'platform' }
> = {
  // Brand & Meta
  'E9yUFZxKPk0fGTmZMoKxkFAboNM.svg': {
    category: 'brand',
    filename: 'omnira-logo-nav.svg',
    description: 'Omnira navbar primary geometric mark',
    usedIn: ['Navbar'],
    licenseKind: 'template',
  },
  '7AIGlpnoV8on201FrcvoFn8P4.svg': {
    category: 'brand',
    filename: 'omnira-logo-footer.svg',
    description: 'Omnira footer geometric mark',
    usedIn: ['Footer'],
    licenseKind: 'template',
  },
  'tHX9pPhKmTRRwWGxPYLzOtXho.svg': {
    category: 'brand',
    filename: 'omnira-favicon.svg',
    description: 'Omnira site favicon SVG',
    usedIn: ['Head/Metadata'],
    licenseKind: 'template',
  },
  'rRfCsY8kiOSAM4H2pcHYXmcwlo8.svg': {
    category: 'brand',
    filename: 'omnira-apple-touch-icon.svg',
    description: 'Omnira apple-touch-icon SVG',
    usedIn: ['Head/Metadata'],
    licenseKind: 'template',
  },
  'DKiwUEdtILCqS2R0ETztXd7tHY.jpg': {
    category: 'brand',
    filename: 'omnira-og-image.jpg',
    description: 'Omnira Open Graph / Twitter social share card image',
    usedIn: ['Head/Metadata'],
    licenseKind: 'template',
  },
  'writing-hand-favicon.png': {
    category: 'brand',
    filename: 'framer-fallback-favicon.png',
    description: 'Framer runtime fallback favicon PNG referenced in init.mjs',
    usedIn: ['FramerRuntime'],
    licenseKind: 'platform',
  },

  // Textures
  'clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg': {
    category: 'textures',
    filename: 'omnira-dark-grain.jpg',
    description: 'Dark surface grain texture (screen blend mode, 4736x3136)',
    usedIn: ['AboutPage', 'ChamferedPanel', 'GlobalGrain'],
    licenseKind: 'template',
  },
  'Px212XLUGoDFI4k0qFQM1pkxE.png': {
    category: 'textures',
    filename: 'omnira-panel-grain.png',
    description: 'Panel grain texture overlay (1448x1086)',
    usedIn: ['ChamferedPanel', 'FeatureCard'],
    licenseKind: 'template',
  },

  // Hero & About Portrait / Signature
  'Sy1FOpVGp8D2UAJSvei3zr08s.png': {
    category: 'hero',
    filename: 'hero-portrait-dotmatrix.png',
    description: 'Hero interactive particle/dot-matrix portrait source image (1254x1254)',
    usedIn: ['HomeHero'],
    licenseKind: 'template',
  },
  'gT7aaTd9Vj2tJgGKKnMgyZh7XI.png': {
    category: 'portraits',
    filename: 'about-profile-portrait.png',
    description: 'About page profile hero portrait (1254x1254)',
    usedIn: ['AboutHero'],
    licenseKind: 'template',
  },
  'I61VevguiXwxDlft3orHdSCaoQ.svg': {
    category: 'brand',
    filename: 'profile-signature.svg',
    description: 'Designer handwritten signature vector mark (95x29)',
    usedIn: ['AboutBiography'],
    licenseKind: 'template',
  },

  // Services / Layered 3D Isometric Stack Graphics
  'i4y7SrEdFXTq2dfS6EBaILcMk8s.png': {
    category: 'services',
    filename: 'service-stack-home-layer-1.png',
    description: 'Home Services Tab 4 / 3D isometric stack layer 1',
    usedIn: ['HomeServices'],
    licenseKind: 'template',
  },
  'R99krk6OPN1XkkZo0gvX58mUo.png': {
    category: 'services',
    filename: 'service-stack-home-layer-2.png',
    description: 'Home Services Tab 4 / 3D isometric stack layer 2',
    usedIn: ['HomeServices'],
    licenseKind: 'template',
  },
  'jcV1GRf10v5jLEPOQONySjQScc.png': {
    category: 'services',
    filename: 'service-stack-home-layer-3.png',
    description: 'Home Services Tab 4 / 3D isometric stack layer 3',
    usedIn: ['HomeServices'],
    licenseKind: 'template',
  },
  'mAEVKNciJxLXPNAoqzu9DCLeNE.png': {
    category: 'services',
    filename: 'service-stack-home-layer-4.png',
    description: 'Home Services Tab 4 / 3D isometric stack layer 4',
    usedIn: ['HomeServices'],
    licenseKind: 'template',
  },
  'pL91H7JbYueyYlfBaqJ54P8NVrQ.png': {
    category: 'services',
    filename: 'service-stack-home-layer-5.png',
    description: 'Home Services Tab 4 / 3D isometric stack layer 5',
    usedIn: ['HomeServices'],
    licenseKind: 'template',
  },
  'IX96wnZHFKkZ4CkKxvOe2RM.png': {
    category: 'services',
    filename: 'service-stack-about-layer-1.png',
    description: 'About System Stack / 3D isometric stack layer 1',
    usedIn: ['AboutHero', 'AboutServices'],
    licenseKind: 'template',
  },
  'wEILxW4gYewea7cS8LA8wZiFfaU.png': {
    category: 'services',
    filename: 'service-stack-about-layer-2.png',
    description: 'About System Stack / 3D isometric stack layer 2',
    usedIn: ['AboutHero', 'AboutServices'],
    licenseKind: 'template',
  },
  'Wi1fmxlgmCXqbsGz9XIbOm8Z9ps.png': {
    category: 'services',
    filename: 'service-stack-about-layer-3.png',
    description: 'About System Stack / 3D isometric stack layer 3',
    usedIn: ['AboutHero', 'AboutServices'],
    licenseKind: 'template',
  },
  'POquvLl5DNV4ddB2ya871EmvM0.png': {
    category: 'services',
    filename: 'service-stack-about-layer-4.png',
    description: 'About System Stack / 3D isometric stack layer 4',
    usedIn: ['AboutHero', 'AboutServices'],
    licenseKind: 'template',
  },
  'CaJnltcQvNkhaEQYafZBlfAzCg.png': {
    category: 'services',
    filename: 'service-stack-about-layer-5.png',
    description: 'About System Stack / 3D isometric stack layer 5',
    usedIn: ['AboutHero', 'AboutServices'],
    licenseKind: 'template',
  },

  // Timeline 2020..2026
  'Q5ttqWayMypFOKawr93eBNQj8.png': {
    category: 'timeline',
    filename: 'timeline-2020.png',
    description: 'Timeline milestone 2020 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },
  '9eq9GWhCmOZP3CVjgECMhws1q90.png': {
    category: 'timeline',
    filename: 'timeline-2021.png',
    description: 'Timeline milestone 2021 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },
  'FvxphlrFir4baiJreIJhZDGdPS4.png': {
    category: 'timeline',
    filename: 'timeline-2022.png',
    description: 'Timeline milestone 2022 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },
  'MCD3GkcRtN3ArTxCU6KUgQNV18.png': {
    category: 'timeline',
    filename: 'timeline-2023.png',
    description: 'Timeline milestone 2023 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },
  '1iUlxmWvaMCgwSxBvvdJ39R1xWI.png': {
    category: 'timeline',
    filename: 'timeline-2024.png',
    description: 'Timeline milestone 2024 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },
  'GiQNd5HblQoHdoYl6bOJXISRHNo.png': {
    category: 'timeline',
    filename: 'timeline-2025.png',
    description: 'Timeline milestone 2025 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },
  '0cgLuZ1DjJ3EkkzXWD8JvmL404.png': {
    category: 'timeline',
    filename: 'timeline-2026.png',
    description: 'Timeline milestone 2026 artwork (1254x1254)',
    usedIn: ['AboutTimeline'],
    licenseKind: 'template',
  },

  // Testimonials Avatars
  'xr7AByWMQArTJoUQ72juGc1wbI.jpg': {
    category: 'testimonials',
    filename: 'testimonial-01-default.jpg',
    description: 'Testimonials default / slide 1 client avatar',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'F7xKBZD13OAZS7v2lY0Dm198.png': {
    category: 'testimonials',
    filename: 'testimonial-02-daniel-kim.png',
    description: 'Testimonial avatar — Daniel Kim',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'rZmnnPdh2NfRFd8GwnJmVeCq5Ow.jpg': {
    category: 'testimonials',
    filename: 'testimonial-03-sarah-chen.jpg',
    description: 'Testimonial avatar — Sarah Chen',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'jHYD50CG2aJRz34ro4OYrlsLDQ.jpg': {
    category: 'testimonials',
    filename: 'testimonial-04-leon-hart.jpg',
    description: 'Testimonial avatar — Leon Hart',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'MxRBWEY4y6KTHK9odDlWcp0lTYY.png': {
    category: 'testimonials',
    filename: 'testimonial-05-sofia-brand.png',
    description: 'Testimonial avatar — Sofia Brand',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'S9PyleA1z5ugBA2Z87N0r7h5VA.jpg': {
    category: 'testimonials',
    filename: 'testimonial-06-mira-klein.jpg',
    description: 'Testimonial avatar — Mira Klein',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },

  // Partner Logos (Logo Cloud)
  'IqKxDRyRX4qoLEnBIi3mdLI1Q.svg': {
    category: 'logos',
    filename: 'partner-logo-01.svg',
    description: 'Partner logo ticker item 01',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'wv22Eg8hr28a5gwn3gPPx1Ma4.svg': {
    category: 'logos',
    filename: 'partner-logo-02.svg',
    description: 'Partner logo ticker item 02',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'PbRnFcOvUjjW788Phwiw4MCXl2k.svg': {
    category: 'logos',
    filename: 'partner-logo-03.svg',
    description: 'Partner logo ticker item 03',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'R2byks8NQNtmIlHMiBdyqLqrc90.svg': {
    category: 'logos',
    filename: 'partner-logo-04.svg',
    description: 'Partner logo ticker item 04',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'IdT5H66BBVtWf4GCyPHLiMMM1Y.svg': {
    category: 'logos',
    filename: 'partner-logo-05.svg',
    description: 'Partner logo ticker item 05',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'NeHSUqqMDzz4hsXc9zOtvzr4kk.svg': {
    category: 'logos',
    filename: 'partner-logo-06.svg',
    description: 'Partner logo ticker item 06',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'jU9dICUp6earhkuXGJZMGRNFPes.svg': {
    category: 'logos',
    filename: 'partner-logo-07.svg',
    description: 'Partner logo ticker item 07',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },
  'h7VY2xZw6J1LTI1Nh2DPPpvjxP0.svg': {
    category: 'logos',
    filename: 'partner-logo-08.svg',
    description: 'Partner logo ticker item 08',
    usedIn: ['TestimonialsLogoCloud'],
    licenseKind: 'template',
  },

  // UI Icons
  '6tTbkXggWgQCAJ4DO2QEdXXmgM.svg': {
    category: 'icons',
    filename: 'arrow-left.svg',
    description: 'Carousel back arrow icon',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  '11KSGbIZoRSg4pjdnUoif6MKHI.svg': {
    category: 'icons',
    filename: 'arrow-right.svg',
    description: 'Carousel next arrow icon',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'KFtt12lgd0m3ZYRAHImJIncBVno.svg': {
    category: 'icons',
    filename: 'rating-star.svg',
    description: 'Testimonial 5-star rating icon',
    usedIn: ['Testimonials'],
    licenseKind: 'template',
  },
  'pGiXYozQ3mE4cilNOItfe2L2fUA.svg': {
    category: 'icons',
    filename: 'spinner-mask.svg',
    description: 'Contact submit button loading spinner SVG mask',
    usedIn: ['ContactForm'],
    licenseKind: 'template',
  },

  // Fallback Project Card Image
  'sH3Z91qPlL31Kt2i6PNdcwGaLVU.jpg': {
    category: 'projects',
    filename: 'project-card-default-fallback.jpg',
    description: 'ProjectCard component default fallback image prop',
    usedIn: ['ProjectCard'],
    licenseKind: 'template',
  },
};

function subsetName(unicodeRange: string): string {
  if (unicodeRange.includes('U+0000-00FF')) return 'latin';
  if (unicodeRange.includes('U+0100-02')) return 'latin-ext';
  if (unicodeRange.includes('U+0102-0103')) return 'vietnamese';
  if (unicodeRange.includes('U+02D7')) return 'thai';
  if (unicodeRange.includes('U+0460-052F')) return 'cyrillic-ext';
  if (unicodeRange.includes('U+0400-045F')) return 'cyrillic';
  if (unicodeRange.includes('U+1F00-1FFF')) return 'greek-ext';
  if (unicodeRange.includes('U+0370-03FF')) return 'greek';
  return crypto.createHash('sha1').update(unicodeRange).digest('hex').slice(0, 6);
}

function collectFontsFromHtml() {
  const htmlDir = path.resolve('research/reference/html');
  const htmlFiles = ['home.html', 'about.html', 'works.html', 'contact.html', '404.html'];
  const fontMap = new Map<
    string,
    { family: string; weight: string; style: string; unicodeRange: string; url: string; subsetLabel: string }
  >();

  for (const file of htmlFiles) {
    const full = path.join(htmlDir, file);
    if (!fs.existsSync(full)) continue;
    const html = fs.readFileSync(full, 'utf8');
    const blocks = html.match(/@font-face\s*\{[^}]+\}/g) || [];
    for (const block of blocks) {
      const family = block.match(/font-family:\s*([^;]+)/i)?.[1]?.replace(/["']/g, '').trim() || 'unknown';
      const weight = block.match(/font-weight:\s*([^;]+)/i)?.[1]?.trim() || '400';
      const style = block.match(/font-style:\s*([^;]+)/i)?.[1]?.trim() || 'normal';
      const unicodeRange = block.match(/unicode-range:\s*([^;]+)/i)?.[1]?.trim() || 'all';
      const url = block.match(/url\(([^)]+)\)/i)?.[1]?.replace(/["']/g, '').trim() || '';
      if (!url.startsWith('http')) continue;
      if (!fontMap.has(url)) {
        fontMap.set(url, {
          family,
          weight,
          style,
          unicodeRange,
          url,
          subsetLabel: subsetName(unicodeRange),
        });
      }
    }
  }
  return fontMap;
}

async function fetchWithRetry(url: string, retries = 3): Promise<{ status: number; contentType: string; buf: Buffer }> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OmniraResearchExtractor/1.0',
        },
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }
      return { status: res.status, contentType, buf };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}

async function runPool<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      await new Promise((r) => setTimeout(r, 80));
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()));
  return results;
}

async function main() {
  const discovered = JSON.parse(fs.readFileSync(path.resolve('research/reference/assets/discovered-assets.json'), 'utf8'));
  const cmsProjects = discovered.cmsProjects as Array<{
    id: string;
    title: string;
    slug: string;
    domain: string;
    imageSrc: string;
  }>;

  const targets: DownloadTarget[] = [];
  const seenBaseUrls = new Set<string>();

  // 1. Register all 27 CMS project thumbnails first
  for (const proj of cmsProjects) {
    const baseUrl = proj.imageSrc.split('?')[0];
    const ext = path.extname(baseUrl) || '.jpg';
    const localRelPath = `projects/${proj.slug}-cover${ext}`;
    seenBaseUrls.add(baseUrl);
    targets.push({
      id: `project-${proj.slug}-cover`,
      url: baseUrl,
      baseUrl,
      category: 'projects',
      localRelPath,
      assetKind: 'image',
      description: `Portfolio project cover thumbnail for ${proj.title} (${proj.domain})`,
      usedIn: ['SelectedWork', 'AboutPreview', 'WorksGrid'],
      originalOrReplacement: 'reference_template_asset',
      licenseStatus: 'Framer Marketplace Single-Use Commercial License (Template Demo Media)',
      licenseEvidence:
        'https://www.framer.com/marketplace/templates/omnira/ & https://www.framer.com/legal/community-terms/ (Section 7.3.2 Single-Use Commercial License)',
    });
  }

  // 2. Register all remaining discovered image URLs
  for (const img of discovered.images as Array<{ baseUrl: string; url: string; sectionContext: string }>) {
    const baseUrl = img.baseUrl;
    if (seenBaseUrls.has(baseUrl)) continue;
    seenBaseUrls.add(baseUrl);

    const fileKey = path.basename(baseUrl);
    const meta = STATIC_IMAGE_MAP[fileKey];
    const ext = path.extname(fileKey).toLowerCase();
    const isSvg = ext === '.svg';
    const category = meta ? meta.category : 'misc';
    const filename = meta ? meta.filename : fileKey;
    const isAssetsPath = baseUrl.includes('/assets/');
    const disambiguatedFilename =
      isAssetsPath && meta ? `cdn-assets-${filename}` : filename;

    targets.push({
      id: `${category}-${path.basename(disambiguatedFilename, path.extname(disambiguatedFilename))}`,
      url: baseUrl,
      baseUrl,
      category,
      localRelPath: `${category}/${disambiguatedFilename}`,
      assetKind: isSvg ? 'svg' : 'image',
      description: meta ? meta.description : `Discovered asset (${img.sectionContext})`,
      usedIn: meta ? meta.usedIn : [img.sectionContext],
      originalOrReplacement: meta?.licenseKind === 'platform' ? 'framer_platform_asset' : 'reference_template_asset',
      licenseStatus:
        meta?.licenseKind === 'platform'
          ? 'Framer Platform Runtime Asset'
          : 'Framer Marketplace Single-Use Commercial License (Template Demo Media)',
      licenseEvidence:
        meta?.licenseKind === 'platform'
          ? 'https://omnira.framer.website/ (Framer runtime init.mjs)'
          : 'https://www.framer.com/marketplace/templates/omnira/ & https://stylokit.com/templates/omnira',
    });
  }

  // 3. Register all @font-face WOFF2 files from all 5 reference HTML pages
  const fontMap = collectFontsFromHtml();
  const usedFontFilenames = new Set<string>();
  for (const f of fontMap.values()) {
    const famSlug = f.family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const urlHash = path.basename(f.url.split('?')[0], '.woff2').slice(0, 8);
    let fname = `${famSlug}-${f.weight}-${f.style}-${f.subsetLabel}.woff2`;
    if (usedFontFilenames.has(fname)) {
      fname = `${famSlug}-${f.weight}-${f.style}-${f.subsetLabel}-${urlHash}.woff2`;
    }
    usedFontFilenames.add(fname);

    const isFramerCdn = f.url.includes('framerusercontent.com');
    targets.push({
      id: `font-${path.basename(fname, '.woff2')}`,
      url: f.url,
      baseUrl: f.url.split('?')[0],
      category: 'fonts',
      localRelPath: `fonts/${fname}`,
      assetKind: 'font',
      description: `${f.family} (${f.weight} ${f.style}, subset ${f.subsetLabel})`,
      usedIn: ['TypographySystem'],
      originalOrReplacement: 'open_source_font',
      licenseStatus: 'SIL Open Font License 1.1 (OFL-1.1)',
      licenseEvidence: isFramerCdn
        ? 'Inter typeface (Rasmus Andersson, SIL OFL 1.1) hosted by Framer font CDN'
        : `Google Fonts (${f.family}, SIL OFL 1.1) delivered via fonts.gstatic.com`,
      fontMeta: {
        family: f.family,
        weight: f.weight,
        style: f.style,
        unicodeRange: f.unicodeRange,
        subsetLabel: f.subsetLabel,
      },
    });
  }

  console.log(`Downloading ${targets.length} assets (images, SVGs, fonts)...`);
  const results = await runPool(targets, 4, async (target, idx) => {
    const outPath = path.join(ASSETS_SOURCE_DIR, target.localRelPath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    try {
      const { status, contentType, buf } = await fetchWithRetry(target.url);
      if (status >= 200 && status < 300) {
        fs.writeFileSync(outPath, buf);
      }
      if ((idx + 1) % 20 === 0 || idx === targets.length - 1) {
        console.log(`Progress: ${idx + 1}/${targets.length}`);
      }
      return {
        ...target,
        httpStatus: status,
        contentType,
        byteSize: buf.length,
        downloadedAt: new Date().toISOString(),
        error: status >= 200 && status < 300 ? null : `HTTP ${status}`,
      } satisfies DownloadResult;
    } catch (err) {
      return {
        ...target,
        httpStatus: 0,
        contentType: '',
        byteSize: 0,
        downloadedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      } satisfies DownloadResult;
    }
  });

  // 4. Also extract meaningful non-border inline SVGs to assets-source/original/icons/inline/
  const inlineOutDir = path.join(ASSETS_SOURCE_DIR, 'icons', 'inline');
  fs.mkdirSync(inlineOutDir, { recursive: true });
  const inlineSaved: Array<{ hash: string; file: string; width: number; height: number; sectionContext: string; framerName: string | null }> = [];
  let inlineIdx = 0;
  for (const svg of discovered.inlineSvgs as Array<{
    hash: string;
    outerHtml: string;
    width: number;
    height: number;
    framerName: string | null;
    sectionContext: string;
  }>) {
    const ctx = `${svg.sectionContext} ${svg.framerName || ''}`;
    if (/BG Border|Corners|corner/i.test(ctx)) continue;
    if (svg.outerHtml.includes('symbol:') && svg.outerHtml.length < 300) continue;
    inlineIdx++;
    const cleanSlug = (svg.framerName || svg.sectionContext || 'svg')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 36);
    const fname = `inline-${String(inlineIdx).padStart(3, '0')}-${cleanSlug || 'icon'}-${svg.hash.slice(0, 6)}.svg`;
    const cleanSvg = svg.outerHtml.replace(/<!-- symbol:[\s\S]*?-->/g, '');
    fs.writeFileSync(path.join(inlineOutDir, fname), cleanSvg, 'utf8');
    inlineSaved.push({
      hash: svg.hash,
      file: `icons/inline/${fname}`,
      width: svg.width,
      height: svg.height,
      sectionContext: svg.sectionContext,
      framerName: svg.framerName,
    });
  }

  const ok = results.filter((r) => !r.error).length;
  const failed = results.filter((r) => r.error);
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalTargets: results.length,
      downloadedOk: ok,
      failedCount: failed.length,
      inlineSvgsExtracted: inlineSaved.length,
    },
    downloads: results,
    inlineSvgs: inlineSaved,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log('Download complete:', report.summary);
  if (failed.length > 0) {
    console.log('Failures:', failed.map((f) => `${f.url} -> ${f.error}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

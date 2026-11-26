import fs from 'node:fs';
import path from 'node:path';
import type { DeduplicatedAsset } from './deduplicate-assets.ts';

interface OptimizationEntry {
  id: string;
  sourceRelPath: string;
  publicPrimaryPath: string;
  derivatives: Array<{
    format: string;
    publicPath: string;
    byteSize: number;
    width: number | null;
    height: number | null;
  }>;
  originalBytes: number;
  bestBytes: number;
  savingsPercent: number;
  hasAlpha: boolean;
}

interface PreparedFont {
  id: string;
  family: string;
  weight: string;
  style: string;
  subsetLabel: string;
  unicodeRange: string;
  publicPath: string;
  byteSize: number;
  sha256: string | null;
}

const ASSETS_REF_DIR = path.resolve('research/reference/assets');
const MANIFESTS_DIR = path.resolve('research/manifests');

function findBestDerivative(opt: OptimizationEntry | undefined, preferFormats: string[]): string | null {
  if (!opt) return null;
  for (const fmt of preferFormats) {
    const match = opt.derivatives.find((d) => d.format === fmt);
    if (match) return match.publicPath;
  }
  return opt.publicPrimaryPath;
}

function main() {
  fs.mkdirSync(MANIFESTS_DIR, { recursive: true });

  const discovered = JSON.parse(fs.readFileSync(path.join(ASSETS_REF_DIR, 'discovered-assets.json'), 'utf8'));
  const downloadManifest = JSON.parse(fs.readFileSync(path.join(ASSETS_REF_DIR, 'download-manifest.json'), 'utf8'));
  const validationReport = JSON.parse(fs.readFileSync(path.join(ASSETS_REF_DIR, 'validation-report.json'), 'utf8'));
  const dedupReport = JSON.parse(fs.readFileSync(path.join(ASSETS_REF_DIR, 'deduplication-report.json'), 'utf8'));
  const optReport = JSON.parse(fs.readFileSync(path.join(ASSETS_REF_DIR, 'optimization-report.json'), 'utf8'));
  const fontsReport = JSON.parse(fs.readFileSync(path.join(ASSETS_REF_DIR, 'fonts-prepared.json'), 'utf8'));

  const cmsProjects = JSON.parse(
    fs.readFileSync(path.resolve('research/reference/content/mD0yv0kks-chunk-default-0.framercms.decoded.json'), 'utf8'),
  ) as Array<{
    id: string;
    PU8bteqhK: string;
    O5iwyiTAI: string;
    u8GCKzMS9: string;
    wQuPbj7YZ: string;
    oWgNH1Iud: string;
    dsL5yhyYV?: { src?: string; pixelWidth?: number; pixelHeight?: number };
  }>;

  const cmsCategories = JSON.parse(
    fs.readFileSync(path.resolve('research/reference/content/a_FhlAd4Y-chunk-default-0.framercms.decoded.json'), 'utf8'),
  ) as Array<{ id: string; QAN3gAK7o: string; aGN8XKkXq: string }>;

  const catById = new Map(cmsCategories.map((c) => [c.id, { label: c.QAN3gAK7o, slug: c.aGN8XKkXq }]));
  const optById = new Map((optReport.assets as OptimizationEntry[]).map((a) => [a.id, a]));
  const fontById = new Map((fontsReport.fonts as PreparedFont[]).map((f) => [f.id, f]));
  const dedupAssets = dedupReport.assets as DeduplicatedAsset[];
  const canonicalLookup = new Map(dedupAssets.map((a) => [a.id, a]));

  const manifestAssets = dedupAssets.map((asset) => {
    const targetId = asset.duplicateOf ?? asset.id;
    const opt = optById.get(targetId);
    const font = fontById.get(targetId);
    const isMissing = !asset.valid || Boolean(asset.error);

    let publicPath: string | null = null;
    if (opt) publicPath = opt.publicPrimaryPath;
    else if (font) publicPath = font.publicPath;

    return {
      id: asset.id,
      assetKind: asset.assetKind,
      category: asset.category,
      description: asset.description,
      usedIn: asset.usedIn,
      sourceUrl: asset.url,
      baseUrl: asset.baseUrl,
      localSourcePath: isMissing ? null : `assets-source/original/${asset.localRelPath}`,
      publicPath,
      derivatives: opt ? opt.derivatives : font ? [{ format: 'woff2', publicPath: font.publicPath, byteSize: font.byteSize }] : [],
      httpStatus: asset.httpStatus,
      contentType: asset.contentType,
      byteSize: asset.byteSize,
      sha256: asset.sha256,
      valid: asset.valid,
      validationErrors: asset.validationErrors,
      detectedFormat: asset.detectedFormat,
      intrinsicWidth: asset.intrinsicWidth,
      intrinsicHeight: asset.intrinsicHeight,
      hasAlpha: asset.hasAlpha,
      isCanonical: asset.isCanonical,
      duplicateOf: asset.duplicateOf,
      originalOrReplacement: isMissing ? 'missing_upstream_replace_with_inline_svg' : asset.originalOrReplacement,
      licenseStatus: asset.licenseStatus,
      licenseEvidence: asset.licenseEvidence,
      fontMeta: asset.fontMeta ?? null,
    };
  });

  const missingAssets = manifestAssets.filter((a) => !a.valid);
  const projectAssets = manifestAssets.filter((a) => a.category === 'projects' && a.id.startsWith('project-') && a.id.endsWith('-cover'));

  const assetsManifest = {
    generatedAt: new Date().toISOString(),
    sourceSite: 'https://omnira.framer.website',
    summary: {
      discoveredUniqueImageBaseUrls: discovered.summary.uniqueImageBaseUrls,
      discoveredUniqueInlineSvgs: discovered.summary.uniqueInlineSvgs,
      discoveredFontFaceUrls: discovered.summary.uniqueFontUrls,
      totalTrackedAssets: manifestAssets.length,
      downloadedOk: downloadManifest.summary.downloadedOk,
      failedDownloads: downloadManifest.summary.failedCount,
      validatedAssets: validationReport.summary.validCount,
      invalidOrMissingAssets: validationReport.summary.invalidCount,
      uniqueSha256Hashes: dedupReport.summary.uniqueHashes,
      canonicalAssets: dedupReport.summary.canonicalCount,
      deduplicatedAssets: dedupReport.summary.duplicateCount,
      optimizedRasterAndSvgAssets: optReport.summary.optimizedAssetsCount,
      totalPublicDerivatives: optReport.summary.totalDerivativesGenerated,
      preparedFontFiles: fontsReport.totalFontsPrepared,
      inlineSvgsExtracted: downloadManifest.summary.inlineSvgsExtracted,
      cmsProjectsTotal: cmsProjects.length,
      cmsProjectsAcquired: projectAssets.filter((p) => p.valid).length,
      cmsProjectsMissing: projectAssets.filter((p) => !p.valid).length,
    },
    works27Discrepancy: {
      liveWorksInitialCount: 12,
      cmsTotalCount: cmsProjects.length,
      screenshotCount: 27,
      resolution:
        'Live /works SSR renders pageSize=12 initially and loads items 13-27 via Framer CMS client-side pagination/filtering. All 27 project cover thumbnails exist on framerusercontent.com in the decoded Framer CMS chunk mD0yv0kks-chunk-default-0.framercms and all 27/27 covers were downloaded, validated, and optimized into public/assets/images/projects/.',
    },
    licensingNotes: {
      templateMarketplace: {
        source: 'https://www.framer.com/marketplace/templates/omnira/',
        creator: 'Dmytri Ivanov (@dmytri-ivanov)',
        priceUsd: 99,
        licenseType: 'Single-Use Commercial License (Paid Content)',
        termsUrl: 'https://www.framer.com/legal/community-terms/',
        section: 'Section 7.3.2',
        summary: 'Permits creating one (1) end product/project; prohibits standalone resale, redistribution, or competing template creation.',
      },
      stylokitListing: {
        source: 'https://stylokit.com/templates/omnira',
        licenseUrl: 'https://stylokit.com/license',
        summary: 'Commercial license for single end project; non-transferable, no redistribution.',
      },
      fonts: {
        families: ['Orbitron', 'Chakra Petch', 'Inter'],
        licenseType: 'SIL Open Font License 1.1 (OFL-1.1)',
        summary: 'Open-source typefaces self-hosted in public/assets/fonts/ from Google Fonts (Orbitron, Chakra Petch) and Framer font CDN (Inter).',
      },
    },
    missingAssets: missingAssets.map((m) => ({
      id: m.id,
      sourceUrl: m.sourceUrl,
      httpStatus: m.httpStatus,
      reason: m.validationErrors.join('; '),
      remediation: 'Render an inline accessible SVG spinner inside ContactForm submit button instead of broken upstream Framer mask URL.',
    })),
    inlineSvgsSummary: {
      totalDiscoveredUnique: discovered.summary.uniqueInlineSvgs,
      nonBorderExtractedCount: downloadManifest.summary.inlineSvgsExtracted,
      proceduralChamferSvgsExcluded: discovered.summary.uniqueInlineSvgs - downloadManifest.summary.inlineSvgsExtracted,
      extractedLocation: 'assets-source/original/icons/inline/',
      note: 'Procedural Framer BG Border / Corners SVGs are replaced by clean CSS clip-path and SVG border components in Next.js.',
    },
    assets: manifestAssets,
  };

  fs.writeFileSync(path.join(MANIFESTS_DIR, 'assets.json'), JSON.stringify(assetsManifest, null, 2));

  // Build component-assets.json
  const byId = new Map(manifestAssets.map((a) => [a.id, a]));
  const assetEntry = (id: string) => {
    const a = byId.get(id);
    if (!a) return null;
    const opt = optById.get(a.duplicateOf ?? a.id);
    return {
      id: a.id,
      publicPath: a.publicPath,
      webp: findBestDerivative(opt, ['webp', 'svg']),
      avif: findBestDerivative(opt, ['avif', 'svg']),
      fallback: findBestDerivative(opt, ['png', 'jpg', 'svg']),
      width: a.intrinsicWidth,
      height: a.intrinsicHeight,
      hasAlpha: a.hasAlpha,
      description: a.description,
    };
  };

  const componentAssets = {
    generatedAt: new Date().toISOString(),
    global: {
      fontsCss: fontsReport.cssFile,
      fontFamilies: ['Orbitron', 'Chakra Petch', 'Inter'],
      brand: {
        navLogo: assetEntry('brand-omnira-logo-nav'),
        footerLogo: assetEntry('brand-omnira-logo-footer'),
        favicon: assetEntry('brand-omnira-favicon'),
        appleTouchIcon: assetEntry('brand-omnira-apple-touch-icon'),
        ogImage: assetEntry('brand-omnira-og-image'),
      },
      textures: {
        darkGrain: assetEntry('textures-omnira-dark-grain'),
        panelGrain: assetEntry('textures-omnira-panel-grain'),
      },
    },
    pages: {
      home: {
        hero: {
          portraitParticleSource: assetEntry('hero-hero-portrait-dotmatrix'),
          renderingMode: 'HTML5 2D Canvas dot-matrix particle system sampling portrait luminance with pointer repulsion',
        },
        process: {
          signalStripInlineSvgRef: 'assets-source/original/icons/inline/inline-014-trailing-content-7bf8aa.svg',
          stepIconsNote: '4 inline 24x24 geometric step icons extracted under assets-source/original/icons/inline/',
        },
        services: {
          homeIsometricStackLayers: [
            assetEntry('services-service-stack-home-layer-1'),
            assetEntry('services-service-stack-home-layer-2'),
            assetEntry('services-service-stack-home-layer-3'),
            assetEntry('services-service-stack-home-layer-4'),
            assetEntry('services-service-stack-home-layer-5'),
          ],
          note: 'Tabs 1-3 render vector schematics + canvas/SVG grids; Tab 4 renders the 5-layer interactive isometric stack.',
        },
        testimonials: {
          avatars: [
            { slideIndex: 1, name: 'Default / Slide 1', asset: assetEntry('testimonials-testimonial-01-default') },
            { slideIndex: 2, name: 'Daniel Kim', asset: assetEntry('testimonials-testimonial-02-daniel-kim') },
            { slideIndex: 3, name: 'Sarah Chen', asset: assetEntry('testimonials-testimonial-03-sarah-chen') },
            { slideIndex: 4, name: 'Leon Hart', asset: assetEntry('testimonials-testimonial-04-leon-hart') },
            { slideIndex: 5, name: 'Sofia Brand', asset: assetEntry('testimonials-testimonial-05-sofia-brand') },
            { slideIndex: 6, name: 'Mira Klein', asset: assetEntry('testimonials-testimonial-06-mira-klein') },
          ],
          controls: {
            arrowLeft: assetEntry('icons-arrow-left'),
            arrowRight: assetEntry('icons-arrow-right'),
            ratingStar: assetEntry('icons-rating-star'),
          },
          partnerLogos: [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
            assetEntry(`logos-partner-logo-${String(n).padStart(2, '0')}`),
          ),
        },
      },
      about: {
        profileHero: {
          portrait: assetEntry('portraits-about-profile-portrait'),
          signature: assetEntry('brand-profile-signature'),
        },
        aboutIsometricStackLayers: [
          assetEntry('services-service-stack-about-layer-1'),
          assetEntry('services-service-stack-about-layer-2'),
          assetEntry('services-service-stack-about-layer-3'),
          assetEntry('services-service-stack-about-layer-4'),
          assetEntry('services-service-stack-about-layer-5'),
        ],
        timeline: [2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => ({
          year: String(yr),
          asset: assetEntry(`timeline-timeline-${yr}`),
        })),
        systemStack: {
          note: '24 tool icons across DESIGN, DEVELOPMENT, MOTION, and 3D / VISUAL are vector SVG marks captured in assets-source/original/icons/inline/.',
        },
      },
      works: {
        totalProjects: cmsProjects.length,
        defaultFallbackCardImage: assetEntry('projects-project-card-default-fallback'),
        projects: cmsProjects.map((proj, index) => {
          const cat = catById.get(proj.O5iwyiTAI) || { label: 'UNKNOWN', slug: 'unknown' };
          return {
            order: index + 1,
            id: proj.id,
            title: proj.PU8bteqhK,
            slug: proj.u8GCKzMS9,
            category: cat.label,
            categorySlug: cat.slug,
            displayDomain: proj.wQuPbj7YZ,
            externalUrl: proj.oWgNH1Iud,
            cover: assetEntry(`project-${proj.u8GCKzMS9}-cover`),
          };
        }),
      },
      contact: {
        formSpinnerMaskUpstreamMissing: {
          id: 'icons-spinner-mask',
          upstreamStatus: canonicalLookup.get('icons-spinner-mask')?.httpStatus ?? 404,
          replacement: 'Use inline CSS/SVG spinner in ContactForm',
        },
      },
    },
  };

  fs.writeFileSync(path.join(MANIFESTS_DIR, 'component-assets.json'), JSON.stringify(componentAssets, null, 2));
  console.log('Manifests built:', {
    assetsManifestCount: manifestAssets.length,
    worksProjectsMapped: componentAssets.pages.works.projects.length,
    missingCount: missingAssets.length,
  });
}

main();

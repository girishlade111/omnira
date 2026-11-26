import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/config/site';
import { contactContent } from '@/content/contact';
import { faqsContent } from '@/content/faqs';
import { pricingContent } from '@/content/pricing';
import { processContent } from '@/content/process';
import { aboutPreviewContent, profileContent } from '@/content/profile';
import {
  aboutPreviewProjects,
  projectCategoryFilters,
  projects,
  selectedWorkProjects,
} from '@/content/projects';
import { servicesContent } from '@/content/services';
import { testimonialsContent } from '@/content/testimonials';
import { timelineContent } from '@/content/timeline';
import { toolsContent } from '@/content/tools';
import { PUBLIC_ASSETS } from '@/lib/assets';
import type { ImageVariants } from '@/types';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function assertPublicAssetExists(publicUrlPath: string) {
  expect(publicUrlPath.startsWith('/assets/')).toBe(true);
  const fullPath = path.join(PUBLIC_DIR, publicUrlPath);
  expect(fs.existsSync(fullPath), `Missing public asset: ${fullPath}`).toBe(true);
  expect(fs.statSync(fullPath).size).toBeGreaterThan(0);
}

function assertVariantsExist(variants: ImageVariants) {
  assertPublicAssetExists(variants.webp);
  assertPublicAssetExists(variants.avif);
  assertPublicAssetExists(variants.fallback);
  expect(variants.width).toBeGreaterThan(0);
  expect(variants.height).toBeGreaterThan(0);
  expect(variants.alt.trim().length).toBeGreaterThan(0);
}

describe('Projects catalog & assets', () => {
  it('contains all 27 projects in exact row-major order with unique slugs and ids', () => {
    expect(projects).toHaveLength(27);
    expect(projects[0].name).toBe('Brandora');
    expect(projects[26].name).toBe('Platify');

    const orders = projects.map((p) => p.order);
    expect(orders).toEqual(Array.from({ length: 27 }, (_, i) => i + 1));

    expect(new Set(projects.map((p) => p.id)).size).toBe(27);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(27);
  });

  it('matches featured counts and category filter memberships', () => {
    expect(selectedWorkProjects).toHaveLength(6);
    expect(aboutPreviewProjects).toHaveLength(4);
    expect(projects.filter((p) => p.featured.inInitialWorksSSR)).toHaveLength(12);

    const expectedCounts: Record<string, number> = {
      'ALL PROJECTS': 27,
      AI: 3,
      BUSINESS: 12,
      'ONE PAGE': 5,
      PORTFOLIO: 7,
    };

    expect(projectCategoryFilters).toHaveLength(5);
    for (const filter of projectCategoryFilters) {
      expect(filter.count).toBe(expectedCounts[filter.label]);
      const matched =
        filter.label === 'ALL PROJECTS'
          ? projects
          : projects.filter((p) => p.categories.includes(filter.label));
      expect(matched).toHaveLength(filter.count);
    }
  });

  it('has valid external URLs and existing local WebP/AVIF/fallback derivatives for all 27 projects', () => {
    for (const proj of projects) {
      expect(proj.externalUrl.startsWith('https://')).toBe(true);
      expect(proj.internalDetailRoute).toBeNull();
      assertVariantsExist(proj.thumbnailVariants);
    }
  });
});

describe('Global & section assets on disk', () => {
  it('verifies every path in PUBLIC_ASSETS exists on disk', () => {
    assertPublicAssetExists(PUBLIC_ASSETS.fontsCss);
    assertPublicAssetExists(PUBLIC_ASSETS.brand.navLogo);
    assertPublicAssetExists(PUBLIC_ASSETS.brand.footerLogo);
    assertPublicAssetExists(PUBLIC_ASSETS.brand.favicon);
    assertPublicAssetExists(PUBLIC_ASSETS.brand.appleTouchIcon);
    assertPublicAssetExists(PUBLIC_ASSETS.brand.profileSignature);
    assertVariantsExist(PUBLIC_ASSETS.brand.ogImage);

    assertVariantsExist(PUBLIC_ASSETS.textures.darkGrain);
    assertVariantsExist(PUBLIC_ASSETS.textures.panelGrain);
    assertVariantsExist(PUBLIC_ASSETS.hero.portraitDotMatrix);
    assertVariantsExist(PUBLIC_ASSETS.about.profilePortrait);
    assertVariantsExist(PUBLIC_ASSETS.projectFallback);

    assertPublicAssetExists(PUBLIC_ASSETS.icons.arrowLeft);
    assertPublicAssetExists(PUBLIC_ASSETS.icons.arrowRight);
    assertPublicAssetExists(PUBLIC_ASSETS.icons.ratingStar);

    expect(PUBLIC_ASSETS.partnerLogos).toHaveLength(8);
    for (const logo of PUBLIC_ASSETS.partnerLogos) {
      assertPublicAssetExists(logo.svgPath);
    }

    expect(PUBLIC_ASSETS.servicesHomeLayers).toHaveLength(5);
    for (const layer of PUBLIC_ASSETS.servicesHomeLayers) {
      assertVariantsExist(layer);
    }

    expect(PUBLIC_ASSETS.servicesAboutLayers).toHaveLength(5);
    for (const layer of PUBLIC_ASSETS.servicesAboutLayers) {
      assertVariantsExist(layer);
    }
  });
});

describe('Structured site, page, and section content', () => {
  it('validates siteConfig clock timezone and navigation', () => {
    expect(siteConfig.clockTimeZone).toBe('Europe/Berlin');
    expect(siteConfig.clockFormat).toBe('12h');
    expect(siteConfig.clockShowSeconds).toBe(true);
    expect(siteConfig.navLinks.map((n) => n.href)).toEqual([
      '/',
      '/about',
      '/works',
      '/contact',
    ]);
    expect(siteConfig.socialLinks).toHaveLength(3);
    expect(siteConfig.demonstrationMode.useLocalAssets).toBe(true);
  });

  it('validates FAQs, Services, Process, Pricing, and Testimonials', () => {
    expect(faqsContent.items).toHaveLength(8);
    expect(faqsContent.items.map((f) => f.code)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
    ]);

    expect(servicesContent.items).toHaveLength(4);
    for (const svc of servicesContent.items) {
      expect(svc.deliverables).toHaveLength(4);
    }

    expect(processContent.phases).toHaveLength(4);
    expect(processContent.principleChips).toHaveLength(4);
    expect(processContent.metrics.map((m) => m.label)).toEqual([
      'PHASES',
      'PRECISION',
      'POSSIBILITIES',
    ]);

    expect(pricingContent.tiers).toHaveLength(3);
    expect(pricingContent.tiers.map((t) => t.priceUsd)).toEqual([
      1200, 2400, 4800,
    ]);
    expect(pricingContent.tiers.filter((t) => t.featured)).toHaveLength(1);
    expect(pricingContent.assuranceStrip).toHaveLength(4);

    expect(testimonialsContent.rating).toBe('4.8');
    expect(testimonialsContent.ratingSubcaption).toBe('FROM 24 CLIENT PROJECTS');
    expect(testimonialsContent.items).toHaveLength(6);
    for (const item of testimonialsContent.items) {
      assertVariantsExist(item.avatar);
    }
    expect(testimonialsContent.partnerLogos).toHaveLength(8);
  });

  it('validates About profile, Timeline (2020-2026), System Stack tools (16), and Contact options', () => {
    expect(aboutPreviewContent.stats.map((s) => `${s.value}${s.suffix}`)).toEqual([
      '6+',
      '40+',
      '10K+',
    ]);
    expect(aboutPreviewContent.capabilities).toHaveLength(4);

    expect(profileContent.details.find((d) => d.label === 'NAME')?.value).toBe(
      'Adrian Voss',
    );
    expect(profileContent.terminal.steps).toHaveLength(5);
    expect(profileContent.terminal.checks).toHaveLength(4);
    expect(profileContent.aboutServices).toHaveLength(4);

    expect(timelineContent.items).toHaveLength(7);
    expect(timelineContent.items.map((t) => t.year)).toEqual([
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
      '2025',
      '2026',
    ]);
    for (const item of timelineContent.items) {
      assertVariantsExist(item.image);
    }

    expect(toolsContent.categories.map((c) => c.category)).toEqual([
      'DESIGN',
      'DEVELOPMENT',
      'MOTION',
      '3D / VISUAL',
    ]);
    const allTools = toolsContent.categories.flatMap((c) => c.tools);
    expect(allTools).toHaveLength(16);
    for (const tool of allTools) {
      expect(tool.url.startsWith('https://')).toBe(true);
      const svgPath = path.resolve(process.cwd(), tool.iconInlineSvgRef);
      expect(fs.existsSync(svgPath), `Missing tool SVG ref: ${svgPath}`).toBe(
        true,
      );
    }

    expect(contactContent.fields).toHaveLength(6);
    expect(contactContent.selectOptions.projectType).toHaveLength(4);
    expect(contactContent.selectOptions.budgetRange).toHaveLength(5);
    expect(contactContent.selectOptions.timeline).toHaveLength(6);
  });

  it('contains zero em-dashes, en-dashes, or non-ASCII characters across content payloads', () => {
    const serialized = JSON.stringify({
      siteConfig,
      projects,
      servicesContent,
      processContent,
      aboutPreviewContent,
      profileContent,
      timelineContent,
      toolsContent,
      testimonialsContent,
      pricingContent,
      faqsContent,
      contactContent,
    });
    expect(serialized).not.toMatch(/[\u2013\u2014]/);
    expect(serialized).not.toMatch(/[^\x00-\x7F]/);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { DeduplicatedAsset } from '../extraction/deduplicate-assets.ts';

interface DerivativeInfo {
  format: 'webp' | 'avif' | 'png' | 'jpg' | 'svg';
  publicPath: string;
  byteSize: number;
  width: number | null;
  height: number | null;
}

interface OptimizedEntry {
  id: string;
  sourceRelPath: string;
  publicPrimaryPath: string;
  derivatives: DerivativeInfo[];
  originalBytes: number;
  bestBytes: number;
  savingsPercent: number;
  hasAlpha: boolean;
}

const ASSETS_SOURCE_DIR = path.resolve('assets-source/original');
const PUBLIC_ASSETS_DIR = path.resolve('public/assets');
const DEDUP_REPORT = path.resolve('research/reference/assets/deduplication-report.json');
const OPT_REPORT = path.resolve('research/reference/assets/optimization-report.json');

function mapPublicSubdir(category: string): string {
  switch (category) {
    case 'brand':
      return 'brand';
    case 'icons':
      return 'icons';
    case 'textures':
      return 'textures';
    case 'hero':
      return 'images/hero';
    case 'portraits':
      return 'images/about';
    case 'projects':
      return 'images/projects';
    case 'services':
      return 'images/services';
    case 'timeline':
      return 'images/timeline';
    case 'testimonials':
      return 'images/testimonials';
    case 'logos':
      return 'images/logos';
    default:
      return `images/${category}`;
  }
}

async function main() {
  const report = JSON.parse(fs.readFileSync(DEDUP_REPORT, 'utf8'));
  const assets = (report.assets as DeduplicatedAsset[]).filter(
    (a) => a.valid && a.isCanonical && (a.assetKind === 'image' || a.assetKind === 'svg'),
  );

  const optimized: OptimizedEntry[] = [];

  for (const asset of assets) {
    const srcPath = path.join(ASSETS_SOURCE_DIR, asset.localRelPath);
    const subdir = mapPublicSubdir(asset.category);
    const parsed = path.parse(asset.localRelPath);
    const outDir = path.join(PUBLIC_ASSETS_DIR, subdir);
    fs.mkdirSync(outDir, { recursive: true });

    if (asset.assetKind === 'svg') {
      const destPath = path.join(outDir, parsed.base);
      fs.copyFileSync(srcPath, destPath);
      const byteSize = fs.statSync(destPath).size;
      const publicPath = `/assets/${subdir}/${parsed.base}`.replace(/\\/g, '/');
      optimized.push({
        id: asset.id,
        sourceRelPath: asset.localRelPath,
        publicPrimaryPath: publicPath,
        derivatives: [
          {
            format: 'svg',
            publicPath,
            byteSize,
            width: asset.intrinsicWidth,
            height: asset.intrinsicHeight,
          },
        ],
        originalBytes: asset.byteSize,
        bestBytes: byteSize,
        savingsPercent: 0,
        hasAlpha: true,
      });
      continue;
    }

    const srcBuf = fs.readFileSync(srcPath);
    const hasAlpha = Boolean(asset.hasAlpha);
    const derivatives: DerivativeInfo[] = [];

    // 1. WebP derivative (high alpha quality + no chroma subsampling for crisp dark edges)
    const webpName = `${parsed.name}.webp`;
    const webpPath = path.join(outDir, webpName);
    await sharp(srcBuf)
      .webp({
        quality: 90,
        alphaQuality: 100,
        effort: 5,
        smartSubsample: false,
      })
      .toFile(webpPath);
    const webpMeta = await sharp(webpPath).metadata();
    derivatives.push({
      format: 'webp',
      publicPath: `/assets/${subdir}/${webpName}`.replace(/\\/g, '/'),
      byteSize: fs.statSync(webpPath).size,
      width: webpMeta.width ?? asset.intrinsicWidth,
      height: webpMeta.height ?? asset.intrinsicHeight,
    });

    // 2. AVIF derivative
    const avifName = `${parsed.name}.avif`;
    const avifPath = path.join(outDir, avifName);
    await sharp(srcBuf)
      .avif({
        quality: 75,
        effort: 4,
      })
      .toFile(avifPath);
    const avifMeta = await sharp(avifPath).metadata();
    derivatives.push({
      format: 'avif',
      publicPath: `/assets/${subdir}/${avifName}`.replace(/\\/g, '/'),
      byteSize: fs.statSync(avifPath).size,
      width: avifMeta.width ?? asset.intrinsicWidth,
      height: avifMeta.height ?? asset.intrinsicHeight,
    });

    // 3. Fallback derivative: PNG for alpha/PNG sources (and small assets), optimized JPG + PNG when appropriate
    if (hasAlpha || asset.detectedFormat === 'png') {
      const pngName = `${parsed.name}.png`;
      const pngPath = path.join(outDir, pngName);
      await sharp(srcBuf)
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .toFile(pngPath);
      const pngMeta = await sharp(pngPath).metadata();
      derivatives.push({
        format: 'png',
        publicPath: `/assets/${subdir}/${pngName}`.replace(/\\/g, '/'),
        byteSize: fs.statSync(pngPath).size,
        width: pngMeta.width ?? asset.intrinsicWidth,
        height: pngMeta.height ?? asset.intrinsicHeight,
      });
    } else {
      const jpgName = `${parsed.name}.jpg`;
      const jpgPath = path.join(outDir, jpgName);
      await sharp(srcBuf)
        .jpeg({
          quality: 90,
          mozjpeg: true,
        })
        .toFile(jpgPath);
      const jpgMeta = await sharp(jpgPath).metadata();
      derivatives.push({
        format: 'jpg',
        publicPath: `/assets/${subdir}/${jpgName}`.replace(/\\/g, '/'),
        byteSize: fs.statSync(jpgPath).size,
        width: jpgMeta.width ?? asset.intrinsicWidth,
        height: jpgMeta.height ?? asset.intrinsicHeight,
      });
    }

    const bestBytes = Math.min(...derivatives.map((d) => d.byteSize));
    const savingsPercent =
      asset.byteSize > 0 ? Number((((asset.byteSize - bestBytes) / asset.byteSize) * 100).toFixed(1)) : 0;

    optimized.push({
      id: asset.id,
      sourceRelPath: asset.localRelPath,
      publicPrimaryPath: derivatives[0].publicPath,
      derivatives,
      originalBytes: asset.byteSize,
      bestBytes,
      savingsPercent,
      hasAlpha,
    });
  }

  const totalOriginal = optimized.reduce((sum, e) => sum + e.originalBytes, 0);
  const totalBest = optimized.reduce((sum, e) => sum + e.bestBytes, 0);
  const summary = {
    optimizedAssetsCount: optimized.length,
    totalDerivativesGenerated: optimized.reduce((sum, e) => sum + e.derivatives.length, 0),
    totalOriginalBytes: totalOriginal,
    totalBestBytes: totalBest,
    overallSavingsPercent:
      totalOriginal > 0 ? Number((((totalOriginal - totalBest) / totalOriginal) * 100).toFixed(1)) : 0,
  };

  fs.writeFileSync(OPT_REPORT, JSON.stringify({ generatedAt: new Date().toISOString(), summary, assets: optimized }, null, 2));
  console.log('Image optimization complete:', summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

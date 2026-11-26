import fs from 'node:fs';
import path from 'node:path';
import type { DeduplicatedAsset } from '../extraction/deduplicate-assets.ts';

const ASSETS_SOURCE_DIR = path.resolve('assets-source/original');
const PUBLIC_FONTS_DIR = path.resolve('public/assets/fonts');
const DEDUP_REPORT = path.resolve('research/reference/assets/deduplication-report.json');
const FONTS_REPORT = path.resolve('research/reference/assets/fonts-prepared.json');

function main() {
  fs.mkdirSync(PUBLIC_FONTS_DIR, { recursive: true });
  const report = JSON.parse(fs.readFileSync(DEDUP_REPORT, 'utf8'));
  const fonts = (report.assets as DeduplicatedAsset[]).filter(
    (a) => a.valid && a.isCanonical && a.assetKind === 'font',
  );

  const cssRules: string[] = [];
  const prepared: Array<{
    id: string;
    family: string;
    weight: string;
    style: string;
    subsetLabel: string;
    unicodeRange: string;
    publicPath: string;
    byteSize: number;
    sha256: string | null;
  }> = [];

  for (const font of fonts) {
    const srcPath = path.join(ASSETS_SOURCE_DIR, font.localRelPath);
    const filename = path.basename(font.localRelPath);
    const destPath = path.join(PUBLIC_FONTS_DIR, filename);
    fs.copyFileSync(srcPath, destPath);
    const publicPath = `/assets/fonts/${filename}`;
    const meta = font.fontMeta || {
      family: 'Unknown',
      weight: '400',
      style: 'normal',
      unicodeRange: 'U+0000-00FF',
      subsetLabel: 'latin',
    };

    cssRules.push(
      `@font-face {\n  font-family: '${meta.family}';\n  font-style: ${meta.style};\n  font-weight: ${meta.weight};\n  font-display: swap;\n  src: url('${publicPath}') format('woff2');${
        meta.unicodeRange && meta.unicodeRange !== 'all'
          ? `\n  unicode-range: ${meta.unicodeRange};`
          : ''
      }\n}`,
    );

    prepared.push({
      id: font.id,
      family: meta.family,
      weight: meta.weight,
      style: meta.style,
      subsetLabel: meta.subsetLabel,
      unicodeRange: meta.unicodeRange,
      publicPath,
      byteSize: fs.statSync(destPath).size,
      sha256: font.sha256,
    });
  }

  fs.writeFileSync(path.join(PUBLIC_FONTS_DIR, 'fonts.css'), cssRules.join('\n\n') + '\n', 'utf8');
  fs.writeFileSync(
    FONTS_REPORT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalFontsPrepared: prepared.length,
        totalBytes: prepared.reduce((s, f) => s + f.byteSize, 0),
        cssFile: '/assets/fonts/fonts.css',
        fonts: prepared,
      },
      null,
      2,
    ),
  );
  console.log('Fonts prepared:', prepared.length, 'files, CSS written to public/assets/fonts/fonts.css');
}

main();

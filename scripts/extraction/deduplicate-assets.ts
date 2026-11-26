import fs from 'node:fs';
import path from 'node:path';
import type { ValidatedAsset } from './validate-assets.ts';

export interface DeduplicatedAsset extends ValidatedAsset {
  duplicateOf: string | null;
  isCanonical: boolean;
}

const VALIDATION_REPORT = path.resolve('research/reference/assets/validation-report.json');
const DEDUP_REPORT = path.resolve('research/reference/assets/deduplication-report.json');

function priorityScore(asset: ValidatedAsset): number {
  let score = 0;
  if (asset.localRelPath.includes('cdn-assets-')) score -= 50;
  if (asset.category === 'misc') score -= 30;
  if (asset.category === 'brand') score += 20;
  if (asset.category === 'projects') score += 20;
  if (asset.category === 'hero' || asset.category === 'portraits') score += 20;
  if (asset.url.includes('/images/')) score += 10;
  return score;
}

function main() {
  const report = JSON.parse(fs.readFileSync(VALIDATION_REPORT, 'utf8'));
  const assets = report.assets as ValidatedAsset[];

  const groupsByHash = new Map<string, ValidatedAsset[]>();
  for (const a of assets) {
    if (!a.sha256) continue;
    const list = groupsByHash.get(a.sha256) || [];
    list.push(a);
    groupsByHash.set(a.sha256, list);
  }

  const canonicalByHash = new Map<string, ValidatedAsset>();
  for (const [hash, list] of groupsByHash) {
    const sorted = [...list].sort((a, b) => priorityScore(b) - priorityScore(a));
    canonicalByHash.set(hash, sorted[0]);
  }

  const output: DeduplicatedAsset[] = assets.map((a) => {
    if (!a.sha256) {
      return { ...a, duplicateOf: null, isCanonical: true };
    }
    const canonical = canonicalByHash.get(a.sha256)!;
    const isCanonical = canonical.id === a.id;
    return {
      ...a,
      isCanonical,
      duplicateOf: isCanonical ? null : canonical.id,
    };
  });

  const duplicateGroups = [...groupsByHash.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([sha256, list]) => ({
      sha256,
      canonicalId: canonicalByHash.get(sha256)!.id,
      members: list.map((m) => ({ id: m.id, localRelPath: m.localRelPath, url: m.url })),
    }));

  const summary = {
    totalAssets: output.length,
    uniqueHashes: groupsByHash.size,
    canonicalCount: output.filter((a) => a.isCanonical).length,
    duplicateCount: output.filter((a) => !a.isCanonical).length,
    duplicateGroupsCount: duplicateGroups.length,
  };

  fs.writeFileSync(
    DEDUP_REPORT,
    JSON.stringify({ generatedAt: new Date().toISOString(), summary, duplicateGroups, assets: output }, null, 2),
  );
  console.log('Deduplication complete:', summary);
}

main();

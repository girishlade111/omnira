import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('research/reference/assets/discovered-assets.json', 'utf8'));

console.log('=== FONTS (' + d.fonts.length + ') ===');
for (const f of d.fonts) {
  console.log(f.family, '|', f.weight, f.style, '|', f.unicodeRange?.slice(0, 35) || '-', '|', f.url);
}

console.log('\n=== MEANINGFUL INLINE SVGS ===');
let count = 0;
for (const s of d.inlineSvgs) {
  const ctx = (s.sectionContext || '') + ' ' + (s.framerName || '');
  if (/BG Border|Corners|corner/i.test(ctx)) continue;
  count++;
  if (count <= 45) {
    console.log(count, s.width + 'x' + s.height, '| occ:', s.occurrences, '| fname:', s.framerName, '| ctx:', s.sectionContext.slice(0, 70), '| len:', s.outerHtml.length);
  }
}
console.log('Total non-border inline SVGs:', count);

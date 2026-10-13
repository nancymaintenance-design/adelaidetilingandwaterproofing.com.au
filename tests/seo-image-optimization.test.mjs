import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const images = [
  ['roof-inspection-concept', 'roof-waterproofing-adelaide.html', 'Roof inspection illustration showing a person with a tablet beside a tiled roof'],
  ['kitchen-tiling-v3', 'kitchen-splashback-tiling-adelaide.html', 'Illustrative kitchen with tiled splashback above a benchtop and around a sink and cooktop'],
];

function dimensions(buffer) {
  let result;
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF', 'must be a real WebP, not a renamed PNG');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    assert.ok(start + size <= buffer.length, 'valid chunk length');
    assert.ok(!['EXIF', 'XMP '].includes(type), 'private metadata must not be copied');
    if (type === 'VP8 ') result = [buffer.readUInt16LE(start + 6) & 0x3fff, buffer.readUInt16LE(start + 8) & 0x3fff];
    if (type === 'VP8X') result = [buffer.readUIntLE(start + 4, 3) + 1, buffer.readUIntLE(start + 7, 3) + 1];
    if (type === 'VP8L') {
      const bits = buffer.readUInt32LE(start + 1);
      result = [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = start + size + (size % 2);
  }
  assert.ok(result, 'WebP image chunk required');
  return result;
}

for (const [name, page, alt] of images) {
  test(`${name}: true WebP variants have declared dimensions and bounded transfer size`, () => {
    for (const [suffix, width, height, ceiling] of [['-400', 400, 267, 35000], ['-800', 800, 533, 80000], ['', 1536, 1024, 200000]]) {
      const path = `assets/${name}${suffix}.webp`;
      assert.ok(existsSync(new URL(path, root)), `${path} exists`);
      const buffer = read(path);
      assert.deepEqual(dimensions(buffer), [width, height]);
      assert.ok(buffer.length <= ceiling, `${path}: ${buffer.length} <= ${ceiling} bytes`);
    }
  });
  test(`${page}: hero selects existing responsive candidates without lazy loading`, () => {
    const html = read(page).toString();
    const img = html.match(new RegExp(`<img[^>]*src="assets/${name}\\.webp"[^>]*>`))?.[0];
    assert.ok(img, 'full WebP hero src required');
    const attr = key => img.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1];
    assert.equal(attr('srcset'), `assets/${name}-400.webp 400w, assets/${name}-800.webp 800w, assets/${name}.webp 1536w`);
    assert.equal(attr('sizes'), '(max-width: 800px) 90vw, (max-width: 1377.78px) calc(45vw - 1.5rem), calc(620px - 1.5rem)');
    assert.equal(attr('width'), '1536');
    assert.equal(attr('height'), '1024');
    assert.equal(attr('alt'), alt);
    assert.notEqual(attr('loading'), 'lazy');
    assert.equal(attr('fetchpriority'), 'high');
    for (const key of ['og:image', 'twitter:image']) {
      assert.match(html, new RegExp(`<meta (?:property|name)="${key}" content="https://www.adelaidetilingandwaterproofing.com.au/assets/${name}\\.webp">`));
    }
  });
}

test('source PNG originals remain byte-identical', () => {
  for (const [path, hash] of [
    ['assets/adelaide-roof-inspection-concept.png', 'a725c7315e1362fbc1f9656c277312006415a748c7953fdbf4ac86b48437d6e4'],
    ['assets/kitchen-tiling-v3.png', '508ec34014c84e52d5f1ad98d194ed7cfea20c2394817a86fdb45fae279277b9'],
  ]) assert.equal(createHash('sha256').update(read(path)).digest('hex'), hash);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markAnimationTargets } from '../src/utils/markAnimationTargets.ts';

const count = (s: string, sub: string) => s.split(sub).length - 1;

// IconCraftView が original / fill / stroke スタイルで作る形
const plain = (id: string) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}-bg-grad"/>
        <filter id="${id}-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="4.00" dy="5.00" stdDeviation="8" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#${id}-shadow)">
        <path d="M0 0" fill="url(#${id}-bg-grad)"/>
      </g>
      <svg x="28" y="28"
           width="44" height="44"
           viewBox="0 0 128 128" overflow="visible">
        <g><path fill="url(#SVGID_1_)" d="M1 1"/></g><linearGradient id="SVGID_1_"/>
      </svg>
    </svg>`;

// WASM の emboss_svg の形 (回転ありだと <g filter="none"> に transform が付く)
const emboss = (rotate: string) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="sticker-shadow"/></defs>
  <g filter="url(#sticker-shadow)">
      <path d="M0 0" fill="url(#sticker-bg-grad)"/>
  </g>
  <g filter="none"${rotate}>
    <svg x="28.00" y="28.00" width="44.00" height="44.00" viewBox="0 0 36 36" overflow="visible">
      <path d="M1 1" fill="url(#sticker-icon-grad)"/>
    </svg>
  </g>
</svg>`;

test('plain layout: shape group and icon svg get their classes', () => {
  const out = markAnimationTargets(plain('ic_01'));
  assert.match(out, /<g filter="url\(#ic_01-shadow\)" class="iconcraft-shape">/);
  assert.match(out, /<\/g>\s*<g class="iconcraft-icon-wrapper"><svg x="28" y="28"[\s\S]*?<\/svg><\/g>\s*<\/svg>$/);
  assert.equal(count(out, 'iconcraft-shape'), 1);
  assert.equal(count(out, 'iconcraft-icon-wrapper'), 1);
});

test('emboss layout without and with rotation', () => {
  for (const rotate of ['', ' transform="rotate(30.0, 50.00, 50.00)"']) {
    const out = markAnimationTargets(emboss(rotate));
    assert.match(out, /<g filter="url\(#sticker-shadow\)" class="iconcraft-shape">/, `rotate="${rotate}"`);
    assert.match(out, /<g filter="none"[^>]*><g class="iconcraft-icon-wrapper"><svg x="28\.00"[\s\S]*?<\/svg><\/g><\/g>/, `rotate="${rotate}"`);
    assert.equal(count(out, 'iconcraft-icon-wrapper'), 1, `rotate="${rotate}"`);
  }
});

test('other filters (e.g. inner-soft) are not marked as the shape', () => {
  const svg = '<svg><g filter="url(#wax-inner-soft)"><path/></g><g filter="url(#wax-shadow)"><path/></g></svg>';
  const out = markAnimationTargets(svg);
  assert.equal(count(out, 'iconcraft-shape'), 1);
  assert.match(out, /<g filter="url\(#wax-inner-soft\)">/);
});

test('empty input', () => {
  assert.equal(markAnimationTargets(''), '');
});

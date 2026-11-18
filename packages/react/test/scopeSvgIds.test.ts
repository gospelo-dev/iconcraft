// Run: node --test test/   (Node 24: TypeScript types are stripped natively)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scopeSvgIds, toSvgIdPrefix } from '../src/utils/scopeSvgIds.ts';

const ids = (svg: string) => [...svg.matchAll(/(?<=\s)id="([^"]+)"/g)].map((m) => m[1]);

test('rewrites id, url(#), href/xlink:href, style attr and <style> refs', () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<style>#SVGID_1_ { opacity: .5 } .a{fill:url(#SVGID_1_)}</style>
<defs><linearGradient id="SVGID_1_"/><path id='b' d="M0 0"/></defs>
<path fill="url(#SVGID_1_)"/><path style="fill:url('#SVGID_1_')"/>
<use xlink:href="#b"/><use href="#b"/></svg>`;
  const out = scopeSvgIds(svg, 'p1');
  assert.deepEqual(ids(out), ['p1-SVGID_1_']);
  assert.match(out, /id='p1-b'/);
  assert.match(out, /<style>#p1-SVGID_1_ \{ opacity: \.5 \} \.a\{fill:url\(#p1-SVGID_1_\)\}<\/style>/);
  assert.match(out, /<path fill="url\(#p1-SVGID_1_\)"\/>/);
  assert.match(out, /style="fill:url\('#p1-SVGID_1_'\)"/);
  assert.match(out, /xlink:href="#p1-b"/);
  assert.match(out, /<use href="#p1-b"\/>/);
  assert.doesNotMatch(out, /#SVGID_1_|#b"/);
});

test('leaves undefined refs, data-id and hex colors alone', () => {
  const svg = `<svg><g id="x" data-id="keep"/><path fill="url(#external)" stroke="#fff"/><use href="#x"/><a href="https://e.com/#x"/></svg>`;
  const out = scopeSvgIds(svg, 'p');
  assert.match(out, /data-id="keep"/);
  assert.match(out, /url\(#external\)/);
  assert.match(out, /stroke="#fff"/);
  assert.match(out, /href="https:\/\/e\.com\/#x"/);
  assert.match(out, /<use href="#p-x"\/>/);
});

test('no ids: returns the same string', () => {
  const svg = '<svg><path d="M0 0"/></svg>';
  assert.equal(scopeSvgIds(svg, 'p'), svg);
  assert.equal(scopeSvgIds('', 'p'), '');
});

test('library ids (instance and mode prefixes) are scoped too', () => {
  const svg = `<svg><defs><filter id="ic_01-shadow"/><linearGradient id="sticker-bg-grad"/></defs><g filter="url(#ic_01-shadow)"><path fill="url(#sticker-bg-grad)"/></g></svg>`;
  const out = scopeSvgIds(svg, 'pA');
  assert.deepEqual(ids(out), ['pA-ic_01-shadow', 'pA-sticker-bg-grad']);
  assert.match(out, /filter="url\(#pA-ic_01-shadow\)"/);
  assert.match(out, /fill="url\(#pA-sticker-bg-grad\)"/);
});

test('two icons sharing SVGID_1_ (and the same icon twice) get disjoint ids', () => {
  const a = '<svg><linearGradient id="SVGID_1_"/><path fill="url(#SVGID_1_)"/></svg>';
  const b = '<svg><radialGradient id="SVGID_1_"/><path fill="url(#SVGID_1_)"/></svg>';
  const page = [scopeSvgIds(a, 'p1'), scopeSvgIds(b, 'p2'), scopeSvgIds(a, 'p3')].join('');
  const all = ids(page);
  assert.equal(new Set(all).size, all.length, 'every id on the page is unique');
  for (const p of ['p1', 'p2', 'p3']) assert.match(page, new RegExp(`id="${p}-SVGID_1_"/><path fill="url\\(#${p}-SVGID_1_\\)"`));
});

test('toSvgIdPrefix makes React useId values safe for ids and CSS', () => {
  for (const reactId of [':r1:', '«r1»', '_r_1_', ':R2a:']) {
    assert.match(toSvgIdPrefix(reactId), /^ic[A-Za-z0-9_-]+$/);
  }
  assert.notEqual(toSvgIdPrefix(':r1:'), toSvgIdPrefix(':r2:'));
});

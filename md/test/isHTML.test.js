import { isHTML } from '../src/index.js';

describe('isHTML', () => {
  test('detect HTML if it has doctype', () => {
    expect(isHTML('<!doctype html>')).toBe(true);
    expect(isHTML('\n\n<!doctype html><html>')).toBe(true);
  });

  test('detect HTML if it has <html>, <body> or <x-*>', () => {
    expect(isHTML('<html>')).toBe(true);
    expect(isHTML('<html></html>')).toBe(true);
    expect(isHTML('<html lang="en"></html>')).toBe(true);
    expect(isHTML('<html><body></html>')).toBe(true);
    expect(isHTML('<html><body class="no-js"></html>')).toBe(true);
    expect(isHTML('<x-unicorn>')).toBe(true);
  });

  test('detect HTML if it contains any of the standard HTML tags', () => {
    expect(isHTML('<p>foo</p>')).toBe(true);
    expect(isHTML('<a href="#">foo</a>')).toBe(true);
  });

  test('not match XML', () => {
    expect(isHTML('<cake>foo</cake>')).toBe(false);
    expect(isHTML('<any>rocks</any>')).toBe(false);
    expect(isHTML('<htmly>not</htmly>')).toBe(false);
    expect(isHTML('<bodyx>not</bodyx>')).toBe(false);
  });
});

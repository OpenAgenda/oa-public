import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { escape, run } from '../lib/xml.js';
import mapOrdered from '../lib/mapOrdered.js';
import { firstChangedLevel, sectionValues } from '../agenda/renderSections.js';

describe('xml', () => {
  test('escape drops what XML cannot carry and escapes the rest', () => {
    assert.equal(
      escape('a\u0000b\u001Fc & <d> "e"'),
      'abc &amp; &lt;d&gt; &quot;e&quot;',
    );
    assert.equal(escape(null), '');
  });

  test('a run keeps line breaks and tabs', () => {
    assert.equal(
      run('a\r\nb\tc'),
      '<w:r><w:t xml:space="preserve">a</w:t><w:br/><w:t xml:space="preserve">b</w:t><w:tab/><w:t xml:space="preserve">c</w:t></w:r>',
    );
  });
});

describe('sections', () => {
  test('values follow the key path, in the export language', () => {
    const event = {
      location: { city: 'Albi', name: null },
      category: { fr: 'Fête', en: 'Party' },
    };

    assert.deepEqual(
      sectionValues(
        event,
        ['location.city', 'location.name', 'category', 'missing.key'],
        'en',
      ),
      ['Albi', null, 'Party', null],
    );
  });

  test('the first changed level opens sections from there down', () => {
    assert.equal(firstChangedLevel(['a', 'b'], null), 0);
    assert.equal(firstChangedLevel(['a', 'b'], ['a', 'b']), -1);
    assert.equal(firstChangedLevel(['a', 'c'], ['a', 'b']), 1);
    assert.equal(firstChangedLevel(['z', 'b'], ['a', 'b']), 0);
  });
});

describe('mapOrdered', () => {
  test('keeps the input order and the concurrency bound', async () => {
    let running = 0;
    let peak = 0;

    const delays = [30, 5, 20, 1, 10, 2];
    const results = [];

    for await (const value of mapOrdered(
      delays,
      async (delay) => {
        running += 1;
        peak = Math.max(peak, running);
        await new Promise((r) => {
          setTimeout(r, delay);
        });
        running -= 1;
        return delay;
      },
      3,
    )) {
      results.push(value);
    }

    assert.deepEqual(results, delays);
    assert.ok(peak <= 3);
  });
});

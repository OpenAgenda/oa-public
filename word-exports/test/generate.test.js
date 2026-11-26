import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough, Readable } from 'node:stream';
import sharp from 'sharp';
import WordExports from '../index.js';
import generate, { agenda, albiEvents } from './lib/generate.js';

const eventTitle = /<w:pStyle w:val="EventTitle"\/>/g;

const bySections = (sections) =>
  [...albiEvents].sort((a, b) => {
    for (const key of sections) {
      const [va, vb] = [a, b].map(
        (e) => key.split('.').reduce((v, p) => v?.[p], e) ?? '',
      );
      if (va !== vb) return va < vb ? -1 : 1;
    }
    return 0;
  });

describe('agenda Word export', () => {
  test('a package Word can open: every part, every part well-formed', async () => {
    const { parts, result } = await generate(albiEvents);

    assert.deepEqual(Object.keys(parts).sort(), [
      '[Content_Types].xml',
      '_rels/.rels',
      'docProps/core.xml',
      'word/_rels/document.xml.rels',
      'word/document.xml',
      'word/footer1.xml',
      'word/settings.xml',
      'word/styles.xml',
    ]);
    assert.equal(result.count, albiEvents.length);
  });

  test('every event, in the order it arrived', async () => {
    const { document, count } = await generate(albiEvents);

    assert.equal(count(eventTitle), albiEvents.length);

    // Each title is looked for after the previous one: some events share one.
    let cursor = 0;

    for (const event of albiEvents) {
      const escaped = event.title.fr
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
      const position = document.indexOf(escaped, cursor);

      assert.notEqual(position, -1, `${event.slug} missing or out of order`);
      cursor = position + escaped.length;
    }
  });

  test('without sections, no chapters and no table of contents', async () => {
    const { document, parts } = await generate(albiEvents);

    assert.doesNotMatch(document, /Heading\d/);
    assert.doesNotMatch(document, /TOC \\o/);
    assert.doesNotMatch(parts['word/settings.xml'], /updateFields/);
    assert.match(
      parts['word/styles.xml'],
      /w:styleId="EventTitle">.*?<w:outlineLvl w:val="0"\/>/s,
    );
  });

  test('one heading level per section key, opened where a value changes', async () => {
    const sections = ['location.city', 'location.name'];
    const events = bySections(sections);
    const { document, count } = await generate(events, { sections });

    const cities = new Set(events.map((e) => e.location.city));
    const places = new Set(
      events.map((e) => `${e.location.city}|${e.location.name}`),
    );

    assert.equal(count(/<w:pStyle w:val="Heading1"\/>/g), cities.size);
    assert.equal(count(/<w:pStyle w:val="Heading2"\/>/g), places.size);
    assert.equal(count(eventTitle), events.length);

    // The first heading comes before the first event.
    assert.ok(document.indexOf('Heading1') < document.indexOf('EventTitle'));
  });

  test('sections bring a table of contents Word fills in on opening', async () => {
    const sections = ['location.city', 'location.name'];
    const { document, parts } = await generate(bySections(sections), {
      sections,
      lang: 'fr',
    });

    assert.match(document, /w:fldCharType="begin" w:dirty="true"/);
    assert.match(document, /TOC \\o &quot;1-2&quot; \\h \\z \\u/);
    assert.match(document, /Sommaire/);
    assert.match(parts['word/settings.xml'], /<w:updateFields w:val="true"\/>/);
    // Event titles sit right under the deepest section in the outline.
    assert.match(
      parts['word/styles.xml'],
      /w:styleId="EventTitle">.*?<w:outlineLvl w:val="2"\/>/s,
    );
  });

  test('under a location heading, the place details; the items do not repeat it', async () => {
    const sections = ['location.name'];
    const events = bySections(sections);
    const { document, count, parts } = await generate(events, { sections });

    const places = new Set(events.map((e) => e.location.name));

    assert.equal(count(/<w:pStyle w:val="Heading1"\/>/g), places.size);
    assert.ok(count(/<w:pStyle w:val="LocationDetail"\/>/g) >= places.size);
    assert.doesNotMatch(
      parts['word/_rels/document.xml.rels'],
      /google\.com\/maps/,
    );

    const { parts: flat } = await generate(events);

    assert.match(flat['word/_rels/document.xml.rels'], /google\.com\/maps/);
    assert.doesNotMatch(flat['word/document.xml'], /LocationDetail"/);
    assert.ok(document);
  });

  test('two venues sharing a name are two sections, each with its details', async () => {
    const [a, b] = albiEvents;
    const place = (uid, address) => ({
      ...a.location,
      uid,
      name: 'Médiathèque',
      address,
    });
    const events = [
      { ...a, location: place(1, '1 rue d’Albi') },
      { ...b, location: place(2, '2 rue de Castres') },
    ];

    const { count, document } = await generate(events, {
      sections: ['location.name'],
    });

    assert.equal(count(/<w:pStyle w:val="Heading1"\/>/g), 2);
    assert.match(document, /rue d’Albi/);
    assert.match(document, /rue de Castres/);
  });

  test('events without a value get an « Unspecified » section of their own', async () => {
    const [a, b] = albiEvents;
    const events = [
      a,
      { ...b, location: { ...b.location, name: null, address: 'En ligne' } },
    ];

    const { count, document } = await generate(events, {
      sections: ['location.name'],
      lang: 'fr',
    });

    assert.equal(count(/<w:pStyle w:val="Heading1"\/>/g), 2);
    assert.match(document, /Non renseigné/);
    // Its address is not in a heading's details: the item keeps it.
    assert.match(document, /En ligne/);
  });

  test('links Word would reject are encoded, or left as text', async () => {
    const [event] = albiEvents;
    const { parts, document } = await generate([
      {
        ...event,
        registration: [
          { type: 'link', value: 'https://site.fr/inscription formulaire' },
          { type: 'email', value: 'jean dupont@x.fr' },
          { type: 'link', value: 'not a url' },
        ],
      },
    ]);
    const rels = parts['word/_rels/document.xml.rels'];

    assert.match(rels, /Target="https:\/\/site\.fr\/inscription%20formulaire"/);
    assert.match(rels, /Target="mailto:jean%20dupont@x\.fr"/);
    assert.doesNotMatch(rels, /Target="[^"]* [^"]*"/);
    assert.match(document, /not a url/);
  });

  test('the include options leave lines out', async () => {
    const event = albiEvents.find(
      (e) => e.description?.fr && e.registration?.length,
    );
    const options = {
      includeDescription: false,
      includeRegistration: false,
      includeEventLink: false,
      includeLocation: false,
      includeAccessibility: false,
    };

    const { document, parts } = await generate([event], options);

    assert.doesNotMatch(document, /EventDescription"/);
    assert.doesNotMatch(document, /Inscription|Registration/);
    assert.doesNotMatch(parts['word/_rels/document.xml.rels'], /\/events\//);
    assert.doesNotMatch(
      parts['word/_rels/document.xml.rels'],
      /google\.com\/maps/,
    );

    const { document: full, parts: fullParts } = await generate([event]);

    assert.match(full, /EventDescription"/);
    assert.match(fullParts['word/_rels/document.xml.rels'], /\/events\//);
  });

  test('an event carrying its canonical address is linked there', async () => {
    const canonicalUrl = 'https://www.example.org/la-mouette';
    const { parts } = await generate([{ ...albiEvents[0], canonicalUrl }]);
    const rels = parts['word/_rels/document.xml.rels'];

    assert.match(rels, /Target="https:\/\/www\.example\.org\/la-mouette"/);
    assert.doesNotMatch(rels, /openagenda\.com\/[^"]*\/events\//);
  });

  test('pictures are embedded beside their event', async () => {
    const jpeg = await sharp({
      create: { width: 200, height: 200, channels: 3, background: '#c33' },
    })
      .jpeg()
      .toBuffer();

    const events = albiEvents.slice(0, 10);
    const withImage = events.filter((e) => e.image);
    const thumbnail = async (e) => (e.image ? jpeg : null);

    const { zip, document, parts } = await generate(
      events,
      { includeEventImages: true },
      { thumbnail },
    );

    const media = Object.keys(zip.files).filter((n) =>
      n.startsWith('word/media/'));

    assert.equal(media.length, withImage.length);
    assert.equal(
      (document.match(/<w:drawing>/g) ?? []).length,
      withImage.length,
    );
    // Every item is laid out in its row, picture or not.
    assert.equal((document.match(/<w:tbl>/g) ?? []).length, events.length);
    assert.equal(
      (
        parts['word/_rels/document.xml.rels'].match(/relationships\/image"/g)
        ?? []
      ).length,
      withImage.length,
    );
  });

  test('a picture that fails leaves the item without one', async () => {
    const { zip } = await generate(
      albiEvents.slice(0, 3),
      { includeEventImages: true },
      { thumbnail: async () => null },
    );

    assert.equal(
      Object.keys(zip.files).filter((n) => n.startsWith('word/media/')).length,
      0,
    );
  });

  test('an empty selection still makes a document, which says so', async () => {
    const { document, result } = await generate([], { lang: 'en' });

    assert.equal(result.count, 0);
    assert.match(document, /No event matches this selection\./);
  });

  test('text XML cannot carry is dropped, the rest escaped', async () => {
    const [event] = albiEvents;
    const { document } = await generate([
      {
        ...event,
        title: { fr: 'A & B <c> \u0001"d"\uFFFE' },
        description: { fr: 'one\ntwo' },
      },
    ]);

    assert.match(document, /A &amp; B &lt;c&gt; &quot;d&quot;/);
    assert.match(document, /one<\/w:t><w:br\/><w:t xml:space="preserve">two/);
  });

  test('a reader going away interrupts the generation, without failing it', async () => {
    const events = Readable.from(
      (async function* slow() {
        for (const event of albiEvents) {
          yield event;
          await new Promise((r) => {
            setTimeout(r, 1);
          });
        }
      }()),
    );
    const output = new PassThrough();

    output.once('data', () => output.destroy());

    const result = await WordExports().agenda.GenerateExportStream(
      events,
      output,
      { agenda },
    );

    assert.equal(result.interrupted, true);
    assert.ok(result.count < albiEvents.length);
  });

  test('a failing event stream fails the generation and the output', async () => {
    const events = Readable.from(
      (async function* failing() {
        yield albiEvents[0];
        throw new Error('search failed');
      }()),
    );
    const output = new PassThrough();
    output.resume();

    const outputError = new Promise((resolve) => output.once('error', resolve));

    await assert.rejects(
      WordExports().agenda.GenerateExportStream(events, output, { agenda }),
      /search failed/,
    );
    assert.match((await outputError).message, /search failed/);
  });
});

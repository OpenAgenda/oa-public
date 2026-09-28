import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import JSZip from 'jszip';
import sharp from 'sharp';
import { XMLValidator } from 'fast-xml-parser';
import WordExports from '../index.js';
import groupTimings from '../lib/timings.js';
import markdownParagraphs from '../lib/markdown.js';
import beglesAgenda from './fixtures/begles.agenda.json' with { type: 'json' };
import beglesEvent from './fixtures/begles.event.json' with { type: 'json' };
import corseAgenda from './fixtures/pciCorse.agenda.json' with { type: 'json' };
import onlineEvent from './fixtures/onlineAttendance.event.json' with { type: 'json' };

const jpeg = await sharp({
  create: { width: 400, height: 300, channels: 3, background: '#36c' },
})
  .jpeg()
  .toBuffer();

const fetchImage = async () => ({ buffer: jpeg, width: 400, height: 300 });

async function render(
  agenda,
  event,
  { lang = 'fr', config = { fetchImage } } = {},
) {
  const output = new PassThrough();
  const chunks = [];

  output.on('data', (chunk) => chunks.push(chunk));

  await WordExports(config).event.render(output, agenda, event, { lang });

  const zip = await JSZip.loadAsync(Buffer.concat(chunks));
  const parts = {};

  for (const [name, entry] of Object.entries(zip.files)) {
    if (!/\.(xml|rels)$/.test(name)) continue;

    parts[name] = await entry.async('string');
    assert.equal(
      XMLValidator.validate(parts[name]),
      true,
      `${name} is not well-formed`,
    );
  }

  return {
    zip,
    parts,
    document: parts['word/document.xml'],
    rels: parts['word/_rels/document.xml.rels'],
    media: Object.keys(zip.files).filter((n) => n.startsWith('word/media/')),
  };
}

describe('event Word export', () => {
  test('the event, its picture and a QR code to its page', async () => {
    const { document, media, rels } = await render(beglesAgenda, beglesEvent);

    assert.match(
      document,
      /<w:pStyle w:val="Title"\/>.*Permanences Addictions/,
    );
    assert.match(document, /Ville de Bègles/);
    assert.deepEqual(media.map((m) => m.split('.').pop()).sort(), [
      'jpeg',
      'png',
    ]);
    assert.match(rels, /openagenda\.com\/agendas\/83339747\/events\/51028839/);
  });

  test('the agenda fields, labelled from the schema, unset ones left out', async () => {
    const { document } = await render(beglesAgenda, beglesEvent);

    assert.match(
      document,
      /Catégories Agenda Métropolitain :.*Conférence - Rencontre/s,
    );
    assert.match(document, /Je suis une association :.*Non/s);
    assert.doesNotMatch(document, /Catégories médiathèque/i);
  });

  test('practical information, the venue and the timings, each in a section', async () => {
    const { document } = await render(beglesAgenda, beglesEvent);

    for (const heading of [
      'Informations pratiques',
      'À propos du lieu',
      'Dates et horaires',
    ]) {
      assert.match(document, new RegExp(`Heading1"/>.*?${heading}`));
    }
    assert.match(document, /De 11 à 50 ans/);
    assert.match(document, /Info Jeunes de Bègles/);
    // On site is the default: not worth a line.
    assert.doesNotMatch(document, /Mode de participation/);
  });

  test('an online event says so, with its access link', async () => {
    const { document, rels } = await render(corseAgenda, onlineEvent);

    assert.match(document, /Mode de participation :.*En ligne/s);
    assert.match(rels, /youtu\.be/);
  });

  test('a cancelled event says so first', async () => {
    const { document } = await render(beglesAgenda, {
      ...beglesEvent,
      status: 6,
    });
    const status = beglesAgenda.schema.fields
      .find((f) => f.field === 'status')
      .options.find((o) => o.id === 6).label.fr;

    assert.ok(
      document.indexOf(status) < document.indexOf('Permanences Addictions'),
    );
  });

  test('without a picture, the document goes without', async () => {
    const { media } = await render(beglesAgenda, beglesEvent, {
      config: { fetchImage: async () => null },
    });

    assert.deepEqual(
      media.map((m) => m.split('.').pop()),
      ['png'],
    );
  });

  test('in English, the labels follow', async () => {
    const { document } = await render(beglesAgenda, beglesEvent, {
      lang: 'en',
    });

    assert.match(document, /Practical information/);
    assert.match(document, /From 11 to 50 years old/);
  });
});

describe('timings', () => {
  test('grouped by month, consecutive days with the same hours as one range', () => {
    const day = (d, h = '18:00') => ({
      begin: `2025-01-${d}T${h}:00+01:00`,
      end: `2025-01-${d}T19:00:00+01:00`,
    });

    const [january] = groupTimings(
      [day('06'), day('07'), day('08'), day('10'), day('11', '17:00')],
      {
        timezone: 'Europe/Paris',
        lang: 'fr',
      },
    );

    assert.equal(january.label, 'Janvier 2025');
    assert.deepEqual(
      january.days.map((d) => `${d.label} ${d.slots.join(', ')}`),
      [
        'Lundi 6 – mercredi 8 18:00 – 19:00',
        'Vendredi 10 18:00 – 19:00',
        'Samedi 11 17:00 – 19:00',
      ],
    );
  });

  test('a day is the event timezone’s day, not the server’s', () => {
    const [month] = groupTimings(
      [
        {
          begin: '2026-09-18T01:30:00-04:00',
          end: '2026-09-18T03:00:00-04:00',
        },
      ],
      { timezone: 'America/Martinique', lang: 'fr' },
    );

    assert.equal(month.label, 'Septembre 2026');
    assert.equal(month.days[0].label, 'Vendredi 18');
  });
});

describe('markdown', () => {
  const writer = { link: () => 'rId9' };

  test('headings, lists, emphasis and links become Word paragraphs', () => {
    const xml = markdownParagraphs(
      writer,
      '## Programme\n\n- **Accueil** à 18h\n- *Débat*\n\n1. un\n2. deux\n\nVoir [le site](https://example.org).',
    );

    assert.match(xml, /Heading3"\/>.*Programme/);
    assert.match(xml, /ListItem"\/>.*• .*<w:b\/>.*Accueil/);
    assert.match(xml, /<w:i\/>.*Débat/);
    assert.match(xml, /2\. /);
    assert.match(xml, /<w:hyperlink r:id="rId9"/);
  });
});

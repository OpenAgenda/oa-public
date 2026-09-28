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

describe('event Word export, edge cases', () => {
  test('a null timezone falls back instead of failing the export', async () => {
    const { document } = await render(beglesAgenda, {
      ...beglesEvent,
      timezone: null,
    });

    assert.match(document, /Dates et horaires/);
  });

  test('a link keeps its formatted text, and the formatting around it', () => {
    const writer = { link: () => 'rId9' };
    const xml = markdownParagraphs(
      writer,
      'see [**here**](https://x.org) and **[bold](https://y.org)**',
    );

    assert.match(
      xml,
      /<w:hyperlink r:id="rId9"[^>]*><w:r><w:rPr><w:rStyle w:val="Hyperlink"\/><w:b\/><\/w:rPr><w:t xml:space="preserve">here</,
    );
    assert.match(
      xml,
      /<w:rStyle w:val="Hyperlink"\/><w:b\/><\/w:rPr><w:t xml:space="preserve">bold</,
    );
    assert.doesNotMatch(xml, />https:\/\/x\.org</);
  });

  test('a list of texts shows every item; a file or a nested object shows nothing', async () => {
    const field = (name, fieldType) => ({
      field: name,
      fieldType,
      schemaType: 'agenda',
      label: { fr: name },
    });
    const agenda = {
      ...beglesAgenda,
      schema: {
        fields: [
          ...beglesAgenda.schema.fields,
          field('liste', 'text'),
          field('document', 'file'),
        ],
      },
    };

    const { document } = await render(agenda, {
      ...beglesEvent,
      liste: ['a', 'b', 'c'],
      document: { filename: 'x.pdf', originalName: 'doc.pdf' },
    });

    assert.match(document, /liste :.*a, b, c/s);
    assert.doesNotMatch(document, /x\.pdf/);
  });

  test('a picture given as a URL string is fetched too', async () => {
    let asked;
    await render(
      beglesAgenda,
      { ...beglesEvent, image: 'https://cdn.example/a.jpg' },
      {
        config: {
          fetchImage: async (image) => {
            asked = image;
            return null;
          },
        },
      },
    );

    assert.equal(asked, 'https://cdn.example/a.jpg');
    assert.equal(
      (await import('../lib/eventImage.js')).eventImageUrl(
        'a.jpg',
        'https://img/main',
      ),
      'https://img/main/a.jpg',
    );
  });

  test('a reader gone during the picture fetch interrupts the render, quietly', async () => {
    const output = new PassThrough();

    const result = await WordExports({
      fetchImage: async () => {
        output.destroy();
        return null;
      },
    }).event.render(output, beglesAgenda, beglesEvent, { lang: 'fr' });

    assert.equal(result.interrupted, true);
  });

  test('a render failing before any byte leaves the response to the caller', async () => {
    const output = new PassThrough();

    await assert.rejects(
      WordExports({ fetchImage }).event.render(
        output,
        {
          ...beglesAgenda,
          schema: {
            fields: [
              { field: 'x', schemaType: 'agenda', options: 'not a list' },
            ],
          },
        },
        { ...beglesEvent, x: 1 },
        { lang: 'fr' },
      ),
    );
    assert.equal(output.destroyed, false);
  });
});

describe('event Word export, the venue', () => {
  test('its picture and credits, map link, contact, tags and links', async () => {
    const { default: detailedEvent } = await import(
      './fixtures/detailedLocation.event.json',
      { with: { type: 'json' } }
    );
    const asked = [];
    const event = {
      ...detailedEvent,
      location: {
        ...detailedEvent.location,
        image: 'https://cdn.example/location.jpg',
        links: [
          'https://museum.example/visit',
          { link: 'https://museum.example/tickets' },
        ],
      },
    };

    const { document, rels, media } = await render(beglesAgenda, event, {
      config: {
        fetchImage: async (image) => {
          asked.push(image);
          return image === 'https://cdn.example/location.jpg'
            ? fetchImage()
            : null;
        },
      },
    });

    assert.ok(asked.includes('https://cdn.example/location.jpg'));
    assert.ok(media.some((m) => m.endsWith('.jpeg')));
    assert.match(document, /Crédits : ©Muséum d'Histoire Naturelle/);
    assert.match(rels, /google\.com\/maps\?q=47\.212388,-1\.56465/);
    assert.match(document, /Voir sur une carte/);
    assert.match(
      document,
      /Étiquettes : Musée de France, Histoire, Sciences et techniques/,
    );
    assert.match(rels, /museum\.example\/visit/);
    assert.match(rels, /museum\.example\/tickets/);
    assert.match(rels, /mailto:museum-sciences@nantesmetropole\.fr/);
  });
});

describe('review fixes', () => {
  const writer = { link: () => 'rId9' };
  const text = (xml) =>
    xml
      .replace(/<w:br\/>/g, '⏎')
      .replace(/<\/w:p>/g, '¶')
      .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1')
      .replace(/<[^>]+>/g, '');

  test('HTML in a description keeps its lines and paragraphs, entities decoded', () => {
    assert.equal(
      text(
        markdownParagraphs(
          writer,
          '<p>Line one<br>Line two</p><p>Next&nbsp;para &eacute;t&eacute;</p>',
        ),
      ),
      'Line one⏎Line two¶Next para été¶',
    );
    assert.equal(
      text(markdownParagraphs(writer, 'line<br/>break')),
      'line⏎break¶',
    );
  });

  test('a reference link keeps its URL', () => {
    const xml = markdownParagraphs(
      writer,
      'See [site][1]\n\n[1]: https://x.example',
    );

    assert.match(xml, /<w:hyperlink r:id="rId9"/);
    assert.equal(text(xml), 'See site¶');
  });

  test('a list marker goes on the item’s first block only, whatever its kind', () => {
    assert.equal(
      text(
        markdownParagraphs(
          writer,
          '- > quote a\n  >\n  > quote b\n- ## heading item',
        ),
      ),
      '• quote a¶quote b¶• heading item¶',
    );
  });

  test('days read weekday first, in English too', () => {
    const [month] = groupTimings(
      [
        { begin: '2026-09-30T08:00:00Z', end: '2026-09-30T16:00:00Z' },
        { begin: '2026-09-29T08:00:00Z', end: '2026-09-29T16:00:00Z' },
      ],
      { timezone: 'Europe/Paris', lang: 'en' },
    );

    assert.equal(month.days[0].label, 'Tuesday 29 – Wednesday 30');
  });

  test('a transparent picture gets a white background, not a black one', async () => {
    const { toDocumentJpeg } = await import('../lib/eventImage.js');
    const png = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();

    const { buffer } = await toDocumentJpeg(png);
    const { data } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    assert.ok(data[0] > 240 && data[1] > 240 && data[2] > 240);
  });

  test('a small picture is not stretched to the page width', async () => {
    const small = await sharp({
      create: { width: 150, height: 100, channels: 3, background: '#36c' },
    })
      .jpeg()
      .toBuffer();
    const { document } = await render(beglesAgenda, beglesEvent, {
      config: {
        fetchImage: async () => ({ buffer: small, width: 150, height: 100 }),
      },
    });
    // 150 px at 150 dpi is one inch: 914400 EMU.
    assert.match(document, /<wp:extent cx="914400" cy="609600"\/>/);
  });

  test('a field of a sub-schema is read at its path', async () => {
    const agenda = {
      ...beglesAgenda,
      schema: {
        fields: [
          ...beglesAgenda.schema.fields,
          {
            field: 'infos',
            schemaType: 'agenda',
            schema: {
              fields: [
                {
                  field: 'salle',
                  fieldType: 'text',
                  schemaType: 'agenda',
                  label: { fr: 'Salle' },
                },
              ],
            },
          },
        ],
      },
    };
    const { document } = await render(agenda, {
      ...beglesEvent,
      infos: { salle: 'Auditorium' },
    });

    assert.match(document, /Salle :.*Auditorium/s);
  });

  test('a venue with neither name nor address: its picture is not fetched', async () => {
    const asked = [];
    await render(
      beglesAgenda,
      {
        ...beglesEvent,
        location: { image: 'https://cdn.example/venue.jpg' },
      },
      {
        config: {
          fetchImage: async (image) => {
            asked.push(image);
            return null;
          },
        },
      },
    );

    assert.ok(!asked.includes('https://cdn.example/venue.jpg'));
  });

  test('only a reader gone is an interruption; other failures are failures', async () => {
    const { isReaderGone, OUTPUT_CLOSED } = await import(
      '../lib/DocxWriter.js'
    );

    assert.equal(
      isReaderGone(Object.assign(new Error(), { code: OUTPUT_CLOSED })),
      true,
    );
    assert.equal(
      isReaderGone(
        Object.assign(new Error(), { code: 'ERR_STREAM_PREMATURE_CLOSE' }),
      ),
      true,
    );
    assert.equal(isReaderGone(new Error('zlib failed')), false);
  });
});

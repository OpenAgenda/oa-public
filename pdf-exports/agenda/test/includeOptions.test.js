import fs from 'node:fs';
import assert from 'node:assert/strict';
import PDFDocument from 'pdfkit';
import addText from '../lib/addText.js';
import addEventItem from '../lib/addEventItem/index.js';
import getIntl from '../../utils/intl.js';

import expoNature from './fixtures/expoNature.event.json' with { type: 'json' };
import agenda from './fixtures/mel.agenda.json' with { type: 'json' };

// The agenda export lets the caller leave five things out of every item: the
// accessibility icons, the description, the link to the event page on
// openagenda.com, the location and the registration entries. Each option
// defaults to true, and a dropped line must not leave an empty row behind —
// the item gets shorter by the height of that line. Without images the item
// is as tall as its lines, not as tall as the thumbnail would have been.

const { PDF_TEST_FOLDER: pdfTestFolder = '/tmp', LANG: lang = 'fr' } = process.env;

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const writeStream = fs.createWriteStream(`${pdfTestFolder}/includeOptions.pdf`);
doc.pipe(writeStream);

// Every string written to the document, so a test can assert what a variant
// left out rather than only measuring it.
const written = [];
const originalText = doc.text.bind(doc);
doc.text = (text, ...args) => {
  written.push(text);
  return originalText(text, ...args);
};

const cursor = { x: 20, y: 20 };

const options = {
  lang,
  includeEventImages: true,
  intl: getIntl(lang),
};

const eventLink = `https://openagenda.com/${agenda.slug}/events/${expoNature.slug}`;
const description = expoNature.description.fr.slice(0, 20);
const locationName = expoNature.location.name;
// Registration labels get an ellipsis past the column width, so match on a
// prefix rather than on the whole value.
const registrationValues = expoNature.registration.map((r) =>
  r.value.slice(0, 20));

assert.ok(registrationValues.length, 'fixture must carry registration entries');

async function renderCase(title, caseOptions) {
  await addText(doc, cursor, title, { fontSize: 16 });
  cursor.y += 30;
  written.length = 0;
  const { height } = await addEventItem(agenda, expoNature, doc, cursor, {
    ...options,
    ...caseOptions,
  });
  cursor.y += height + 20;
  const text = written.join('\n');
  return { height, text };
}

const everything = await renderCase('Everything (default)', {});
assert.ok(everything.text.includes(eventLink), 'default keeps the event link');
assert.ok(
  everything.text.includes(description),
  'default keeps the description',
);
assert.ok(everything.text.includes(locationName), 'default keeps the location');
for (const value of registrationValues) {
  assert.ok(
    everything.text.includes(value),
    `default keeps the registration entry ${value}`,
  );
}

// The icons share the dates line, so their absence shows in the width the
// positioning reports, not in the height.
assert.ok(
  Object.values(expoNature.accessibility).some(Boolean),
  'fixture must carry accessibility flags',
);
const iconsDrawn = [];
const originalImage = doc.image.bind(doc);
doc.image = (src, ...args) => {
  if (typeof src === 'string' && src.includes('/accessibility/')) {
    iconsDrawn.push(src);
  }
  return originalImage(src, ...args);
};
const withAccessibility = await renderCase('includeAccessibility: true', {});
assert.ok(iconsDrawn.length > 0, 'default draws the accessibility icons');
iconsDrawn.length = 0;
const withoutAccessibility = await renderCase('includeAccessibility: false', {
  includeAccessibility: false,
});
assert.equal(iconsDrawn.length, 0, 'accessibility icons dropped');
assert.ok(
  Math.abs(withoutAccessibility.height - withAccessibility.height) < 0.01,
  'the dates line stays, so the height does not move',
);
doc.image = originalImage;

const withoutDescription = await renderCase('includeDescription: false', {
  includeDescription: false,
});
assert.ok(
  !withoutDescription.text.includes(description),
  'description dropped',
);
assert.ok(withoutDescription.text.includes(eventLink), 'event link kept');
assert.ok(withoutDescription.height < everything.height, 'item got shorter');

const withoutEventLink = await renderCase('includeEventLink: false', {
  includeEventLink: false,
});
assert.ok(!withoutEventLink.text.includes(eventLink), 'event link dropped');
assert.ok(withoutEventLink.text.includes(locationName), 'location kept');
assert.ok(withoutEventLink.height < everything.height, 'item got shorter');

const withoutLocation = await renderCase('includeLocation: false', {
  includeLocation: false,
});
assert.ok(!withoutLocation.text.includes(locationName), 'location dropped');
assert.ok(withoutLocation.text.includes(eventLink), 'event link kept');
assert.ok(withoutLocation.height < everything.height, 'item got shorter');

const withoutRegistration = await renderCase('includeRegistration: false', {
  includeRegistration: false,
});
assert.ok(
  !registrationValues.some((value) => withoutRegistration.text.includes(value)),
  'registration entries dropped',
);
assert.ok(withoutRegistration.text.includes(eventLink), 'event link kept');
assert.ok(withoutRegistration.height < everything.height, 'item got shorter');

const bare = await renderCase('All five options off', {
  includeAccessibility: false,
  includeDescription: false,
  includeEventLink: false,
  includeLocation: false,
  includeRegistration: false,
});
// The thumbnail sets a floor on the item height, which a bare item can reach.
assert.ok(
  bare.height <= withoutDescription.height,
  'bare item is the shortest',
);
assert.ok(bare.height <= withoutEventLink.height, 'bare item is the shortest');
assert.ok(bare.height <= withoutLocation.height, 'bare item is the shortest');
assert.ok(
  bare.height <= withoutRegistration.height,
  'bare item is the shortest',
);
assert.ok(bare.height < everything.height, 'bare item is shorter than default');

// Without images the item is only as tall as its lines: the thumbnail floor
// used to apply even when nothing was drawn in its place.
const bareNoImage = await renderCase('All five options off, no image', {
  includeEventImages: false,
  includeAccessibility: false,
  includeDescription: false,
  includeEventLink: false,
  includeLocation: false,
  includeRegistration: false,
});
assert.ok(
  bareNoImage.height < bare.height,
  'no thumbnail floor without images',
);
assert.ok(bareNoImage.height < 90, 'two lines fit well under the image height');

// The simulate pass must agree with the real one, since pagination relies on it.
const simulated = await addEventItem(
  agenda,
  expoNature,
  doc,
  { x: 20, y: 20 },
  {
    ...options,
    includeLocation: false,
    simulate: true,
  },
);
assert.ok(
  Math.abs(simulated.height - withoutLocation.height) < 0.01,
  'simulate matches',
);

doc.end();

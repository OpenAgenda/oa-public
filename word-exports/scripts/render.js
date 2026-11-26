// Renders the fixture agenda in a few variants into `word-test/` (or
// WORD_TEST_FOLDER), to open in Word or LibreOffice. Pictures are fetched for
// real.
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import logs from '@openagenda/logs';
import WordExports from '../index.js';
import valueAt from '../lib/valueAt.js';
import agenda from '../test/fixtures/albi.agenda.json' with { type: 'json' };
import events from '../test/fixtures/albi.events.json' with { type: 'json' };

const log = logs('scripts/render');

const folder = path.resolve(process.env.WORD_TEST_FOLDER ?? 'word-test');

fs.mkdirSync(folder, { recursive: true });

const get = (event, key) => valueAt(event, key) ?? '';

const sortedBy = (sections) =>
  [...events].sort((a, b) => {
    for (const key of sections) {
      const [va, vb] = [get(a, key), get(b, key)];
      if (va !== vb) return va < vb ? -1 : 1;
    }
    return 0;
  });

const variants = {
  flat: { sections: null },
  'city-location': { sections: ['location.city', 'location.name'] },
  'city-location-images': {
    sections: ['location.city', 'location.name'],
    includeEventImages: true,
  },
  bare: {
    sections: null,
    includeDescription: false,
    includeRegistration: false,
    includeEventLink: false,
  },
};

const wordExports = WordExports();

for (const [name, options] of Object.entries(variants)) {
  const file = path.join(folder, `${name}.docx`);

  await wordExports.agenda.GenerateExportStream(
    Readable.from(options.sections ? sortedBy(options.sections) : events),
    fs.createWriteStream(file),
    { agenda, lang: 'fr', ...options },
  );

  log.info('written', {
    file,
    kilobytes: Math.round(fs.statSync(file).size / 1024),
  });
}

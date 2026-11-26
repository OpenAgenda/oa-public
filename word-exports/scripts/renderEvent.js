// Renders fixture events into `word-test/` (or WORD_TEST_FOLDER), to open in
// Word or LibreOffice. Pictures are fetched for real.
import fs from 'node:fs';
import path from 'node:path';
import logs from '@openagenda/logs';
import WordExports from '../index.js';

const log = logs('scripts/renderEvent');

const folder = path.resolve(process.env.WORD_TEST_FOLDER ?? 'word-test');
const fixture = (name) =>
  JSON.parse(
    fs.readFileSync(
      `${import.meta.dirname}/../test/fixtures/${name}.json`,
      'utf-8',
    ),
  );

fs.mkdirSync(folder, { recursive: true });

const cases = {
  begles: ['begles.agenda', 'begles.event'],
  animanas: ['ndm.agenda', 'animanas.event'],
  online: ['pciCorse.agenda', 'onlineAttendance.event'],
};

const wordExports = WordExports();

for (const [name, [agendaName, eventName]] of Object.entries(cases)) {
  const file = path.join(folder, `event-${name}.docx`);

  await wordExports.event.render(
    fs.createWriteStream(file),
    fixture(agendaName),
    fixture(eventName),
    { lang: process.env.TEST_LANG ?? 'fr' },
  );

  log.info('written', {
    file,
    kilobytes: Math.round(fs.statSync(file).size / 1024),
  });
}

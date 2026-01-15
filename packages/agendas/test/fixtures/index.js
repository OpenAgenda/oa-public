import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fixtures from '@openagenda/fixtures';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let config;

function build(files, options, cb) {
  fixtures(
    [
      {
        table: config.schemas.agenda,
        src: `${__dirname}/../model.sql`,
      },
      {
        table: config.schemas.agenda,
        src: `${__dirname}/agenda.data.sql`,
      },
      {
        table: config.schemas.agendaEvent,
        src: `${__dirname}/agenda_event.data.sql`,
      },
      {
        table: config.schemas.stakeholder,
        src: `${__dirname}/stakeholder.data.sql`,
      },
    ].filter((f) => files.includes(f.src.split('/').pop().split('.')[0])),
    options,
    cb,
  );
}

export default build;

export function init(c) {
  config = c;

  fixtures.init({ mysql: config.mysql });
}

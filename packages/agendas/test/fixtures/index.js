'use strict';

const fixtures = require('@openagenda/fixtures');

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

module.exports = build;

module.exports.init = (c) => {
  config = c;

  fixtures.init({ mysql: config.mysql });
};

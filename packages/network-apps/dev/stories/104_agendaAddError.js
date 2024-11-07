import _ from 'lodash';

// simple dev db
import fixtures from './fixtures.json' with { type: 'json' };

// dev interface functions
import interfaces from './interfaces.js';

async function addAgendaToNetwork(_uid, _slug) {
  throw new Error('Could not add agenda');
}

export default {
  interfaces: _.assign({}, interfaces(fixtures), {
    addAgendaToNetwork,
  }),
};

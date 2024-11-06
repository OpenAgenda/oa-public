import _ from 'lodash';

// simple dev db
import fixtures from './fixtures.json' with { type: 'json' };

// dev interface functions
import interfaces from './interfaces.js';

async function getNetworkAgendas(_uid) {
  throw new Error('Could not load network agendas');
}

export default {
  interfaces: _.assign({}, interfaces(fixtures), {
    getNetworkAgendas,
  }),
};

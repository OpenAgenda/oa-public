import _ from 'lodash';

// simple dev db
import fixtures from './fixtures.json' with { type: 'json' };

// dev interface functions
import interfaces from './interfaces.js';

async function listNetworks() {
  throw new Error('Could not load network list');
}

export default {
  interfaces: _.assign({}, interfaces(fixtures), {
    listNetworks,
  }),
};

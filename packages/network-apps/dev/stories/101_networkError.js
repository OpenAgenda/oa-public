import _ from 'lodash';

// simple dev db
import fixtures from './fixtures.json' with { type: 'json' };

// dev interface functions
import interfaces from './interfaces.js';

async function getNetworkSchema(_uid) {
  throw new Error('Could not load network details');
}

export default {
  interfaces: _.assign({}, interfaces(fixtures), {
    getNetworkSchema,
  }),
};

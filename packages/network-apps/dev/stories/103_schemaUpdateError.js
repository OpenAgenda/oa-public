import _ from 'lodash';

// simple dev db
import fixtures from './fixtures.json' with { type: 'json' };

// dev interface functions
import interfaces from './interfaces.js';

async function setNetworkSchemaFields(_uid, _fields) {
  throw new Error('Could not save network schema');
}

export default {
  interfaces: _.assign({}, interfaces(fixtures), {
    setNetworkSchemaFields,
  }),
};

'use strict';

const _ = require('lodash');

// simple dev db
const fixtures = require('./fixtures.json');

// dev interface functions
const interfaces = require('./interfaces')(fixtures);

async function setNetworkSchemaFields(_uid, _fields) {
  throw new Error('Could not save network schema');
}

module.exports = {
  interfaces: _.assign({}, interfaces, {
    setNetworkSchemaFields,
  }),
};

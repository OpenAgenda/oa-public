'use strict';

const _ = require('lodash');

// simple dev db
const fixtures = require('./fixtures.json');

// dev interface functions
const interfaces = require('./interfaces')(fixtures);

async function listNetworks() {
  throw new Error('Could not load network list');
}

module.exports = {
  interfaces: _.assign({}, interfaces, {
    listNetworks,
  }),
};

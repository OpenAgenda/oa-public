'use strict';

const _ = require('lodash');

// simple dev db
const fixtures = require('./fixtures.json');

// dev interface functions
const interfaces = require('./interfaces')(fixtures);

async function addAgendaToNetwork(_uid, _slug) {
  throw new Error('Could not add agenda');
}

module.exports = {
  interfaces: _.assign({}, interfaces, {
    addAgendaToNetwork,
  }),
};

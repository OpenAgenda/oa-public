'use strict';

const _ = require('lodash');

// simple dev db
const fixtures = require('./fixtures.json');

// dev interface functions
const interfaces = require('./interfaces')(fixtures);

async function getNetworkAgendas(_uid) {
  throw new Error('Could not load network agendas');
}

module.exports = {
  interfaces: _.assign({}, interfaces, {
    getNetworkAgendas,
  }),
};

'use strict';

const head = require('./head');
const parseEvent = require('./parseEvent');

module.exports = {
  head,
  parseEvent,
  tail: () => ''
};

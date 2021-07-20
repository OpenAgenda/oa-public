'use strict';

module.exports = ({ event }) => !!Object.keys(event || {}).length;

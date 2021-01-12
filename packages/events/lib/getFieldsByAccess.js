'use strict';

const fields = require('./fields');

module.exports = (type, value) => fields.filter(f => (f[type] || []).includes(value));

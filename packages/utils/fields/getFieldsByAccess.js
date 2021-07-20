'use strict';

module.exports = (fields, type, value) => fields.filter(f => (f[type] || []).includes(value));

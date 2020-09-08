'use strict';

module.exports = {
  isActivated: {
    type: 'boolean',
    optional: true
  },
  isBlacklisted: {
    type: 'boolean',
    optional: true
  },
  isRemoved: {
    type: 'boolean',
    optional: true
  },
  isBasic: {
    type: 'boolean',
    optional: true
  },
  isNew: {
    type: 'boolean',
    optional: true
  },
  apiKey: {
    type: 'text',
    optional: true
  },
  apiSecret: {
    type: 'text',
    optional: true
  }
};

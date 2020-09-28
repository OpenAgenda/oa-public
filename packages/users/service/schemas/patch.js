'use strict';

module.exports = {
  fullName: {
    optional: true,
    type: 'text'
  },
  culture: {
    optional: true,
    type: 'text',
    min: 2,
    max: 2
  },
  image: {
    optional: true,
    type: 'pass'
  }
};

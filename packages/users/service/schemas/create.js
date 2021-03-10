'use strict';

module.exports = {
  fullName: {
    type: 'text',
    min: 2,
    optional: false,
  },
  username: {
    type: 'text',
  },
  culture: {
    type: 'text',
    min: 2,
    max: 2,
    default: 'fr',
  },
  email: {
    type: 'email',
    optional: false,
  },
  password: {
    type: 'text',
    min: 4,
    optional: false,
  },
  twitterId: {
    type: 'text',
  },
  googleId: {
    type: 'text',
  },
  facebookUid: {
    type: 'text',
  },
};

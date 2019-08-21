'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  text: require('@openagenda/validators/text')
});

module.exports = schema({
  after: {
    type: 'text',
    list: true,
    default: null
  },
  offset: {
    type: 'integer',
    default: null
  },
  limit: {
    type: 'integer',
    default: 20
  },
  page: {
    type: 'integer',
    default: null
  },
  order: {
    type: 'choice',
    default: 'id.asc',
    unique: true,
    options: [
      'id.asc',
      'id.desc',
      'slug.asc',
      'slug.desc',
      'actionsCounter.asc',
      'actionsCounter.desc'
    ]
  }
});

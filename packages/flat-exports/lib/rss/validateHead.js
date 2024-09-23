'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');
const link = require('@openagenda/validators/link');

schema.register({
  integer,
  text,
  link,
});

const validate = schema({
  title: {
    type: 'text',
  },
  description: {
    type: 'text',
    optional: true,
  },
  feedURL: {
    type: 'link',
    optional: false,
  },
  siteURL: {
    type: 'link',
    optional: false,
  },
  generator: {
    type: 'text',
    default: 'OpenAgenda',
  },
  imageURL: {
    type: 'link',
    optional: true,
  },
  language: {
    type: 'text',
    optional: false,
  },
  ttl: {
    type: 'integer',
    default: 120,
  },
});

module.exports = (head) =>
  _.extend(validate(head), {
    custom_namespaces: {
      ev: 'http://purl.org/rss/1.0/modules/event/',
    },
  });

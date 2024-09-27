'use strict';

const schema = require('@openagenda/validators/schema');
const legacy = JSON.parse(JSON.stringify(require('./fields/legacy')));
const text = require('@openagenda/validators/text');
const boolean = require('@openagenda/validators/boolean');
const link = require('@openagenda/validators/link');
const number = require('@openagenda/validators/number');
const integer = require('@openagenda/validators/integer');
const date = require('@openagenda/validators/date');
const choice = require('@openagenda/validators/choice');
const email = require('@openagenda/validators/email');
const ip = require('@openagenda/validators/ip');
const pass = require('@openagenda/validators/pass');
const slug = require('../slugs/validator');

schema.register({
  text,
  boolean,
  link,
  number,
  integer,
  date,
  slug,
  choice,
  email,
  ip,
  pass,
});

module.exports = schema(legacy.public);

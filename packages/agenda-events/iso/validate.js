'use strict';

const eventStates = require('./states');

const schema = require('@openagenda/validators/schema');

const _ = {
  extend: require('lodash/extend'),
  keys: require('lodash/keys'),
  isObject: require('lodash/isObject'),
  pick: require('lodash/pick'),
  assign: require('lodash/assign'),
  omit: require('lodash/omit'),
  get: require('lodash/get')
}

schema.register({
  integer: require('@openagenda/validators/integer'),
  boolean: require('@openagenda/validators/boolean'),
  choice: require('@openagenda/validators/choice'),
  date: require('@openagenda/validators/date'),
  pass: require('@openagenda/validators/pass'),
  text: require('@openagenda/validators/text')
});

const fields = {
  eventUid: {
    type: 'integer',
    optional: false
  },
  agendaUid: {
    type: 'integer',
    optional: false
  },
  userUid: {
    type: 'integer'
  },
  aggregated: {
    type: 'boolean',
    default: false
  },
  sourcePaths: {
    type: 'pass',
    list: true
  },
  featured: {
    type: 'boolean',
    default: false
  },
  canEdit: {
    type: 'boolean',
    default: false
  },
  state: {
    type: 'choice',
    default: eventStates.PUBLISHED,
    unique: true,
    optional: false,
    options: _.keys(eventStates).map(k => eventStates[k])
  },
  legacyId: {
    type: 'text',
    optional: true
  },
  createdAt: {
    type: 'date'
  },
  updatedAt: {
    type: 'date'
  }
}

const validate = schema(fields);

const validateData = schema(_.pick(fields, [
  'state',
  'featured',
  'userUid',
  'sourcePaths',
  'aggregated'
]));

module.exports = v => validate(_preClean(v));

module.exports.validateData = (v, options = {}) => {
  const {
    optionalSecondaryFields,
    partial
  } = {
    optionalSecondaryFields: false,
    partial: false,
    ...options
  };

  const preCleaned = _preClean(v);

  const validateFn = partial
    ? validateData.part.bind(null, _pickSetFields(preCleaned))
    : validateData;

  const clean = validateFn(preCleaned);

  return  _postClean(v, clean, {
    optionalSecondaryFields
  });
};

module.exports.validateData.fields = validateData.fields


function _postClean( v, c, { optionalSecondaryFields } ) {
  if ( !optionalSecondaryFields ) return c;

  return _.omit(c, [
    'state',
    'featured',
    'sourcePaths',
    'aggregated'
  ].filter(f => _.get(v, f, null) === null));
}

function _preClean(v) {
  let cleanState;

  if (!_.isObject(v)) return v;

  if (v.state === undefined) return v;

  try {
    cleanState = parseInt(v.state);
  } catch (e) {
    return v;
  }

  return Object.assign({}, v, {
    state: cleanState
  });
}

function _pickSetFields(preCleaned) {
  const aeFields = Object.keys(validateData.fields);

  return Object.keys(preCleaned).filter(field => aeFields.includes(field));
}

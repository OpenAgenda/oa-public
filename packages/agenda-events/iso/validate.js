import _ from 'lodash';
import ih from 'immutability-helper';
import schema from '@openagenda/validators/schema/index';

import integerValidator from '@openagenda/validators/integer';
import booleanValidator from '@openagenda/validators/boolean';
import choiceValidator from '@openagenda/validators/choice';
import dateValidator from '@openagenda/validators/date';
import passValidator from '@openagenda/validators/pass';
import textValidator from '@openagenda/validators/text';

import eventStates from './states.js';

schema.register({
  integer: integerValidator,
  boolean: booleanValidator,
  choice: choiceValidator,
  date: dateValidator,
  pass: passValidator,
  text: textValidator,
});

const fields = {
  eventUid: {
    type: 'integer',
    optional: false,
  },
  agendaUid: {
    type: 'integer',
    optional: false,
  },
  userUid: {
    type: 'integer',
    default: null,
  },
  aggregated: {
    type: 'text',
    default: null,
    max: 32,
  },
  sourcePaths: {
    type: 'pass',
    list: true,
  },
  featured: {
    type: 'boolean',
    default: false,
  },
  canEdit: {
    type: 'boolean',
    default: false,
  },
  state: {
    type: 'choice',
    default: eventStates.PUBLISHED,
    unique: true,
    optional: false,
    options: _.keys(eventStates).map((k) => eventStates[k]),
  },
  createdAt: {
    type: 'date',
  },
  updatedAt: {
    type: 'date',
  },
  removed: {
    type: 'boolean',
    default: false,
  },
  motive: {
    type: 'text',
    max: 1000,
    optional: true,
  },
};

const validate = schema(fields);

const internalValidateData = schema(
  _.pick(fields, [
    'state',
    'featured',
    'userUid',
    'sourcePaths',
    'aggregated',
    'motive',
  ]),
);

function _pickSetFields(preCleaned) {
  const aeFields = Object.keys(internalValidateData.fields);

  return Object.keys(preCleaned).filter((field) => aeFields.includes(field));
}

function _postClean(v, c, { optionalSecondaryFields }) {
  if (!optionalSecondaryFields) return c;

  return _.omit(
    c,
    ['state', 'featured', 'sourcePaths', 'aggregated', 'motive'].filter(
      (f) => _.get(v, f, null) === null,
    ),
  );
}

function _preClean(v) {
  if (!_.isObject(v)) return v;

  const update = {
    $unset: [],
  };

  if (v.state !== undefined) {
    try {
      update.state = {
        $set: parseInt(v.state, 10),
      };
    } catch (e) {
      /* e */
    }
  }

  if (v.sourceAgendaUid) {
    update.$unset.push('sourceAgendaUid');
    try {
      update.sourcePaths = {
        $set: JSON.parse(v.sourceAgendaUid),
      };
    } catch (e) {
      /* e */
    }
  }

  if (v.motive && v.state !== -1) {
    update.$unset.push('motive');
  }

  return ih(v, update);
}

export default (v) => validate(_preClean(v));

export function validateData(v, options = {}) {
  const { optionalSecondaryFields, partial } = {
    optionalSecondaryFields: false,
    partial: false,
    ...options,
  };

  const preCleaned = _preClean(v);

  const validateFn = partial
    ? internalValidateData.part.bind(null, _pickSetFields(preCleaned))
    : internalValidateData;

  const clean = validateFn(preCleaned);

  return _postClean(v, clean, {
    optionalSecondaryFields,
  });
}

validateData.fields = internalValidateData.fields;

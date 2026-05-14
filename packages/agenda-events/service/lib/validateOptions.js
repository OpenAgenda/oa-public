import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';

import booleanValidator from '@openagenda/validators/boolean';
import passValidator from '@openagenda/validators/pass';
import choiceValidator from '@openagenda/validators/choice';
import textValidator from '@openagenda/validators/text';

schema.register({
  boolean: booleanValidator,
  choice: choiceValidator,
  pass: passValidator,
  text: textValidator,
});

const base = {
  protected: {
    type: 'boolean',
    default: true,
  },
  aggregated: {
    type: 'text',
    max: 32,
    default: null,
  },
  decorate: {
    type: 'choice',
    options: ['member', 'sourceAgendas', 'user'],
  },
  throwOnNotFound: {
    type: 'boolean',
    default: false,
  },
  removed: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  context: {
    optional: true,
    default: null,
    fields: {
      // user at the origin of the operation
      userUid: {
        type: 'integer',
        default: null,
      },
      // user at the origin of the operation
      user: {
        type: 'pass',
        default: null,
      },
      agendaUid: {
        type: 'integer',
        default: null,
      },
      deletion: {
        type: 'boolean',
        optional: true,
        default: false,
      },
      // if event is in hand, it can be added to context to avoid multiple loads
      event: {
        type: 'pass',
        optional: true,
        default: null,
      },
      // if agenda is in hand, it can be added to context to avoid multiple loads
      agenda: {
        type: 'pass',
        optional: true,
        default: null,
      },
      aggregated: {
        type: 'boolean',
        default: false,
      },
      // if ref was added by aggregation, source agenda can be provided by context
      sourceAgenda: {
        type: 'pass',
        default: null,
      },
      // when the update is part of a mass update
      batched: {
        type: 'boolean',
        default: false,
      },
      stateChangeType: {
        type: 'text',
        default: null,
      },
      // Origin of duplication
      duplicateOrigin: {
        type: 'pass',
        default: null,
      },
      member: {
        type: 'pass',
        optional: true,
        default: null,
      },
    },
  },
};

const validates = {
  default: schema(base),
  create: schema(_.omit(base, ['context.fields.deletion'])),
  update: schema(_.omit(base, ['context.fields.deletion'])),
  remove: schema({
    ..._.omit(base, ['context.fields.deletion']),
    soft: { type: 'boolean', default: true },
  }),
};

export default (values, operation = 'default') => validates[operation](values);

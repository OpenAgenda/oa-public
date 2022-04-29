'use strict';

const c = require('../contributionTypes');
const s = require('../eventStates');

module.exports = [{
  field: 'id',
  type: 'integer',
  optional: false,
  read: ['internal'],
  write: ['internal']
}, {
  field: 'uid',
  type: 'integer',
  optional: false,
  read: ['internal', 'public', 'legacy', 'legacyPrivate', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'title',
  type: 'text',
  min: 2,
  max: 255,
  optional: false,
  read: ['internal', 'public', 'legacy', 'legacyPublic', 'administrator', 'moderator']
}, {
  field: 'description',
  type: 'text',
  max: 255,
  optional: false,
  read: ['internal', 'private', 'legacy', 'legacyPublic', 'administrator', 'moderator']
}, {
  field: 'slug',
  type: 'slug',
  min: 2,
  max: 255,
  optional: false,
  read: ['internal', 'public', 'legacy', 'legacyPublic', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'url',
  type: 'link',
  read: ['internal', 'public', 'legacy', 'legacyPublic', 'administrator', 'moderator'],
  max: 255
}, {
  field: 'official',
  type: 'boolean',
  default: false,
  read: ['internal', 'public', 'legacy', 'legacyPublic', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'networkUid',
  type: 'integer',
  optional: true,
  default: null,
  read: ['internal', 'public', 'legacy', 'legacyPublic', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'locationSetUid',
  type: 'integer',
  optional: true,
  default: null,
  read: ['internal', 'public', 'legacy', 'legacyPublic', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'ownerId',
  type: 'integer',
  optional: false,
  read: ['internal', 'legacy', 'legacyPrivate'],
  write: ['internal']
}, {
  field: 'updatedAt',
  type: 'date',
  optional: false,
  read: ['internal', 'public', 'legacy', 'legacyPrivate', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'createdAt',
  type: 'date',
  optional: false,
  read: ['internal', 'public', 'legacy', 'legacyPrivate', 'administrator', 'moderator'],
  write: ['internal']
}, {
  field: 'formSchemaId',
  type: 'integer',
  optional: true,
  default: null,
  read: ['internal', 'legacy', 'legacyPrivate'],
  write: ['internal']
}, {
  field: 'officializedAt',
  type: 'date',
  default: null,
  read: ['internal', 'public', 'legacy', 'legacyPrivate'],
  write: ['internal']
}, {
  field: 'image',
  read: ['public', 'legacy', 'legacyPrivate', 'administrator', 'moderator'],
  type: 'pass',
  default: null
}, {
  field: 'private',
  type: 'boolean',
  default: false,
  read: ['internal', 'public', 'legacy', 'legacyPrivate'],
  write: ['internal']
}, {
  field: 'indexed',
  type: 'boolean',
  default: true,
  read: ['internal', 'public', 'legacy', 'legacyPrivate'],
  write: ['internal']
}, {
  field: 'settings',
  type: 'schema',
  read: ['public', 'legacy'],
  fields: [{
    field: 'tracking',
    type: 'schema',
    read: ['administrator', 'internal', 'legacy', 'legacyPublic'],
    write: ['administrator', 'internal'],
    fields: [{
      field: 'googleAnalytics',
      type: 'text',
      max: 255
    }]
  }, {
    field: 'lab',
    type: 'schema',
    read: ['administrator', 'internal', 'legacy', 'legacyPublic'],
    write: ['administrator', 'internal'],
    fields: [{
      field: 'status',
      type: 'boolean',
      default: false
    }]
  }, {
    field: 'inbox',
    type: 'schema',
    read: ['administrator', 'internal', 'legacy', 'legacyPublic'],
    write: ['administrator', 'internal'],
    fields: [{
      field: 'mailto',
      type: 'schema',
      fields: [{
        field: 'enabled',
        type: 'boolean',
        default: false
      }, {
        field: 'email',
        type: 'email',
        default: null
      }, {
        field: 'subject',
        type: 'text',
        default: null
      }, {
        field: 'body',
        type: 'text',
        default: null
      }]
    }]
  }, {
    field: 'contribution',
    type: 'schema',
    read: ['administrator', 'internal', 'public', 'legacy', 'legacyPublic'],
    fields: [{
      field: 'type',
      default: c.OPEN,
      type: 'choice',
      optional: false,
      unique: true,
      options: [c.MEMBERS_ONLY, c.CLOSED, c.OPEN]
    }, {
      field: 'defaultState',
      default: s.PUBLISHED,
      type: 'choice',
      optional: false,
      unique: true,
      options: [s.NOT_VALIDATED, s.VALIDATED, s.PUBLISHED]
    }, {
      field: 'canPublish',
      type: 'choice',
      default: [
        'administrators',
        'moderators'
      ],
      options: [
        'administrators',
        'moderators'
      ]
    }, {
      field: 'moderateOnChangeBy',
      type: 'choice',
      default: [],
      options: [
        'administrator',
        'moderator',
        'contributor'
      ]
    }, {
      field: 'defaultLang',
      default: null,
      type: 'choice',
      optional: true,
      unique: true,
      options: [ 'en', 'fr', 'it', 'es', 'de', 'ar', null ]
    }, {
      field: 'allowLocationCreate',
      type: 'boolean',
      default: true
    }, {
      field: 'messages',
      type: 'schema',
      fields: [{
        field: 'instructions',
        type: 'text'
      }, {
        field: 'complete',
        type: 'text'
      }, {
        field: 'publication',
        type: 'text'
      }, {
        field: 'GDPRInformation',
        type: 'text'
      }]
    }, {
      field: 'useFields',
      description: 'require members to fill in a member form',
      type: 'boolean',
      default: false
    }, {
      field: 'authorizedIPAddresses',
      read: ['internal', 'administrator', 'moderator', 'legacy', 'legacyPublic'],
      type: 'ip',
      list: true,
      default: []
    }]
  }, {
    field: 'translation',
    optional: true,
    type: 'schema',
    read: ['internal', 'administrator', 'moderator', 'legacy', 'legacyPublic'],
    write: ['internal', 'administrator', 'moderator'],
    fields: [{
      field: 'enabled',
      type: 'boolean',
      default: false
    }, {
      field: 'source',
      type: 'text',
      min: 2,
      max: 2,
      default: 'fr'
    }, {
      field: 'sets',
      type: 'schema',
      list: { min: 0 },
      default: [],
      fields: [{
        field: 'source',
        type: 'text',
        min: 2,
        max: 2,
        default: 'fr'
      }, {
        field: 'target',
        list: { min: 0 },
        type: 'text',
        min: 2,
        max: 2,
        default: [ 'en', 'es', 'it', 'de' ]
      }, {
        field: 'checked',
        list: {
          min: 0
        },
        type: 'text',
        min: 2,
        max: 2,
        default: []
      }]
    }, {
      field: 'service',
      type: 'text',
      default: 'reverso'
    },{
      field: 'options',
      type: 'text'
    }]
  }]
}, {
  field: 'credentials',
  type: 'schema',
  read: ['internal', 'legacy', 'legacyPrivate'],
  write: ['internal'],
  fields: [{
    field: 'useContributeApp',
    description: 'Use new contribute application for creating and editing events',
    type: 'boolean',
    default: true
  }, {
    field: 'useAgendaSchema',
    description: 'Use agenda schema app to customize fields',
    type: 'boolean',
    default: true
  }, {
    field: 'premiumCustomFields',
    description: 'Allow adding multiple custom fields to agenda form',
    type: 'boolean',
    default: false
  }, {
    field: 'moderators',
    description: 'Add Moderator to member roles',
    type: 'boolean',
    default: false
  }, {
    field: 'tags',
    description: 'Agenda tags are made available.',
    type: 'boolean',
    default: false
  }, {
    field: 'embedsHead',
    description: 'Integrated agendas: The content of the <head> tag can be edited',
    type: 'boolean',
    default: true
  }, {
    field: 'embedsTemplates',
    description: 'Integrated agendas: Custom templates can be defined',
    type: 'boolean',
    default: true
  }, {
    field: 'indesign',
    description: 'Burn this with fire.',
    type: 'boolean',
    default: false
  }, {
    field: 'activatingInvitations',
    description: 'When the user with no account is invited to the agenda, no activation mail is required to complete signup',
    type: 'boolean',
    default: false
  }, {
    field: 'emailstrategie',
    description: 'Newsletter app used by Est-Ensemble only. To be deprecated',
    type: 'boolean',
    default: false
  }, {
    field: 'aggregator',
    description: 'Agenda aggregation. Do not forget to initialize the tab on the agenda admin menu',
    type: 'boolean',
    default: false
  }, {
    field: 'invitationMessage',
    description: 'Members invitation message can be customized',
    type: 'boolean',
    default: false
  }, {
    field: 'prioritizedAggregator',
    description: 'Prioritized queue for important aggregation networks',
    type: 'boolean',
    default: false
  }, {
    field: 'docxExport',
    description: 'Word export feature',
    type: 'boolean',
    default: false
  }, {
    field: 'calendarView',
    description: 'Agenda calendar view',
    type: 'boolean',
    default: false
  }, {
    field: 'eventOwnershipTransfer',
    description: 'Transfer ownership of event from one member to another within an agenda',
    type: 'boolean',
    default: false
  }, {
    field: 'graphs',
    description: 'Display graph tab on agenda admin',
    type: 'boolean',
    default: false
  }, {
    field: 'useJSONBridge',
    description: 'JSON export V1 is generated from the V2 format',
    type: 'boolean',
    default: false
  }]
}];

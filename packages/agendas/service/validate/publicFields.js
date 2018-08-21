"use strict";

const c = require( './contributionTypes' );

const s = require( './eventStates' );

module.exports = {
  title: { 
    type: 'text', 
    min: 2, 
    max: 255, 
    optional: false
  },
  description: {
    type: 'text',
    max: 160,
    optional: false
  },
  slug: {
    type: 'slug',
    min: 2,
    max: 255,
    optional: false
  },
  url: {
    type: 'link',
    max: 255
  },
  official: {
    type: 'boolean',
    default: false
  },
  settings: {
    inbox: {
      mailto: {
        type: 'email',
        default: null
      }
    },
    mailing: {
      eventAggregation: {
        type: 'boolean',
        default: false
      }
    },
    contribution: {
      type: {
        default: c.MEMBERS_ONLY,
        type: 'choice',
        optional: false,
        unique: true,
        options: [ c.MEMBERS_ONLY, c.CLOSED, c.OPEN ]
      },
      defaultState: {
        default: s.PUBLISHED,
        type: 'choice',
        optional: false,
        unique: true,
        options: [ s.NOT_VALIDATED, s.VALIDATED, s.PUBLISHED ]
      },
      canPublish: {
        type: 'choice',
        default: [
          'administrators',
          'moderators'
        ],
        options: [
          'administrators',
          'moderators'
        ]
      },
      moderateOnChangeBy: {
        type: 'choice',
        default: [],
        options: [
          'administrators',
          'moderators',
          'contributors'
        ]
      },
      defaultLang: {
        default: null,
        type: 'choice',
        optional: true,
        unique: true,
        options: [ 'en', 'fr', 'it', 'es', 'de', 'ar', null ]
      },
      allowLocationCreate: {
        default: true,
        type: 'boolean'
      },
      // this moved to messages.instruction
      message: {
        type: 'text'
      },
      messages: {
        instructions: {
          type: 'text'
        },
        complete: {
          type: 'text'
        },
        publication: {
          type: 'text'
        }
      },
      useFields: {
        type: 'boolean',
        default: false
      },
      authorizedIPAddresses: {
        // if set, only those IPs should be allowed to access the agenda edition and contribution pages
        type: 'ip',
        list: true,
        default: []
      },
      survey: {
        // survey allows for a survey to be given at the end of the contribution process
        type: 'boolean',
        default: false
      }
    },
    translation: {
      optional: true,
      fields: {
        enabled: {
          type: 'boolean',
          default: false
        },
        source: {
          type: 'text',
          min: 2,
          max: 2,
          default: 'fr'
        },
        sets: {
          list: { min: 0 },
          default: [],
          fields: {
            source: {
              type: 'text',
              min: 2,
              max: 2,
              default: 'fr'
            },
            target: {
              list: { min: 0 },
              type: 'text',
              min: 2,
              max: 2,
              default: [ 'en', 'es', 'it', 'de' ]
            },
            checked: {
              list: {
                min: 0
              },
              type: 'text',
              min: 2,
              max: 2,
              default: []
            }
          }
        },
        service: {
          type: 'text',
          default: 'reverso'
        },
        options: {
          type: 'text'
        }
      }
    }
  }
}

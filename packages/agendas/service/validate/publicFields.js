"use strict";

const c = require( './contributionTypes' );

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
    contribution: {
      type: {
        default: c.MEMBERS_ONLY,
        type: 'choice',
        optional: false,
        unique: true,
        options: [ c.MEMBERS_ONLY, c.CLOSED, c.OPEN ]
      },
      defaultState: {
        default: 2,
        type: 'integer',
        optional: false,
        min: 0, // to be controlled
        max: 2  // published
      },
      message: {
        type: 'text'
      },
      useFields: {
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
              list: { min: 0 },
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
"use strict";

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
        default: 0,
        type: 'number',
        optional: false,
        min: 0, // no contribution
        max: 2  // contribution on invitation only
      },
      defaultState: {
        default: 2,
        type: 'number',
        optional: false,
        min: 0, // to be controlled
        max: 2  // published
      },
      message: {
        type: 'text'
      }
    }
  }
}
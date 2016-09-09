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
  official: {
    type: 'boolean',
    default: false
  },
  contribution: {
    type: {
      default: 0,
      type: 'number',
      optional: false,
      min: 0, // no contribution
      max: 2  // contribution on invitation only
    },
    message: {
      type: 'text'
    }
  },
  url: {
    type: 'link'
  }
}
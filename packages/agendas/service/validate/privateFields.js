"use strict";

module.exports = {

  uid: {
    type: 'number',
    optional: false
  },
  
  ownerId: {
    type: 'number',
    optional: false
  },
  
  updatedAt: {
    type: 'date',
    optional: false
  },

  createdAt: {
    type: 'date',
    optional: false
  },
  
  image: {
    type: 'text'
  },

  credentials: {

    moderators: {
      type: 'boolean',
      default: false
    },
    tags: {
      type: 'boolean',
      default: false
    },
    embedsHead: {
      type: 'boolean',
      default: false
    },
    embedsTemplates: {
      type: 'boolean',
      default: false
    }

  }

}
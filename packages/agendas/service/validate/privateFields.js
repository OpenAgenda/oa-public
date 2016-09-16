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

    // activate moderators
    moderators: {
      type: 'boolean',
      default: false
    },

    // activate agenda tags
    tags: {
      type: 'boolean',
      default: false
    },

    // add lines inside embed <head>
    embedsHead: {
      type: 'boolean',
      default: false
    },

    // customize embed templates
    embedsTemplates: {
      type: 'boolean',
      default: false
    },

    // old indesign tab
    indesign: {
      type: 'boolean',
      default: false
    },

    // invitations that trigger instant account verification ( no activation email required )
    activatingInvitations: {
      type: 'boolean',
      default: false
    },

    // emailstrategie tab
    emailstrategie: {
      type: 'boolean',
      default: false 
    }

  }

}
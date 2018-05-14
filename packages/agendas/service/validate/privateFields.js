"use strict";

module.exports = {

  uid: {
    type: 'integer',
    optional: false
  },
  
  ownerId: {
    type: 'integer',
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

  formSchemaId: {
    type: 'integer',
    optional: true
  },

  officializedAt: {
    type: 'date',
    default: null
  },
  
  image: {
    type: 'text'
  },

  private: {
    type: 'boolean',
    default: false
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
    },

    // agenda can be an aggregator
    aggregator: {
      type: 'boolean',
      default: false
    },

    // invitation message can be customized
    invitationMessage: {
      type: 'boolean',
      default: false
    },

    // special queue to avoid huge free aggregation jobs
    prioritizedAggregator: {
      type: 'boolean',
      default: false
    },

    // Microsoft word export for the ministry of culture
    docxExport: {
      type: 'boolean',
      default: false
    },

    // display calendar view for agenda
    calendarView: {
      type: 'boolean',
      default: false
    }

  }

}
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

  networkUid: {
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

  indexed: {
    type: 'boolean',
    default: true
  },

  credentials: {

    useContributeApp: {
      description: 'Use new contribute application for creating and editing events',
      type: 'boolean',
      default: false
    },

    useAgendaSchema: {
      description: 'Use agenda schema app to customize fields',
      type: 'boolean',
      default: false
    },

    premiumCustomFields: {
      description: 'Allow adding multiple custom fields to agenda form',
      type: 'boolean',
      default: false
    },

    // activate moderators
    moderators: {
      description: 'Add Moderator to member roles',
      type: 'boolean',
      default: false
    },

    // activate agenda tags
    tags: {
      description: 'Agenda tags are made available.',
      type: 'boolean',
      default: false
    },

    // add lines inside embed <head>
    embedsHead: {
      description: 'Integrated agendas: The content of the <head> tag can be edited',
      type: 'boolean',
      default: false
    },

    // customize embed templates
    embedsTemplates: {
      description: 'Integrated agendas: Custom templates can be defined',
      type: 'boolean',
      default: false
    },

    // old indesign tab
    indesign: {
      description: 'Burn this with fire.',
      type: 'boolean',
      default: false
    },

    // invitations that trigger instant account verification ( no activation email required )
    activatingInvitations: {
      description: 'When the user with no account is invited to the agenda, no activation mail is required to complete signup',
      type: 'boolean',
      default: false
    },

    // emailstrategie tab
    emailstrategie: {
      description: 'Newsletter app used by Est-Ensemble only. To be deprecated',
      type: 'boolean',
      default: false
    },

    // agenda can be an aggregator
    aggregator: {
      description: 'Agenda aggregation. Do not forget to initialize the tab on the agenda admin menu',
      type: 'boolean',
      default: false
    },

    // invitation message can be customized
    invitationMessage: {
      description: 'Members invitation message can be customized',
      type: 'boolean',
      default: false
    },

    // special queue to avoid huge free aggregation jobs
    prioritizedAggregator: {
      description: 'Prioritized queue for important aggregation networks',
      type: 'boolean',
      default: false
    },

    // Microsoft word export for the ministry of culture
    docxExport: {
      description: 'Word export feature',
      type: 'boolean',
      default: false
    },

    // display calendar view for agenda
    calendarView: {
      description: 'Agenda calendar view',
      type: 'boolean',
      default: false
    },

    eventOwnershipTransfer: {
      description: 'Transfer ownership of event from one member to another within an agenda',
      type: 'boolean',
      default: false
    }

  }

}

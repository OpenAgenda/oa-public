"use strict";

module.exports = {

  mysql: {
    host: '127.0.0.1',
    database: 'oatest_custom',
    password: 'grut',
    user: 'root',
    ssl: true
  },

  schemas: {
    custom: 'custom'
  },

  legacy: {
    schemas: {
      event: `legacy_event`,
      agendaEvent: `legacy_agenda_event`,
      agendaEventTag: `legacy_agenda_event_tag`,
      agenda: `agenda`
    },
    interfaces: {
      getFormSchemaFields: async formSchemaId => {

        // need some
        return []; // should be an array of fields

      }
    }
  },

  interfaces: {

    onCreate: () => {
    },

    onUpdate: () => {
    },

    onRemove: () => {
    },

    getValidator: async formSchemaId => {

      return null; // should be a validator

    }

  }

};

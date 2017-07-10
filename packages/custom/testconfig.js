"use strict";

module.exports = {
  
  mysql: {
    host : '127.0.0.1',
    database : 'oatest_extended_event',
    password : 'grut',
    user : 'root'
  },

  schemas: {
    custom: 'custom'
  },

  interfaces: {

    getValidator: async formSchemaId => {

      return null; // should be a validator

    }

  }

}
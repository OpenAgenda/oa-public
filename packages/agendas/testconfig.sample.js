"use strict";

module.exports = {

  mysql : {
    host : '127.0.0.1',
    database : 'agenda_test',
    password : 'grut',
    user : 'root'
  },

  schemas : {
    agenda: 'agenda',
    occurrence: 'occurrence',
    agendaEvent: 'agenda_event',
    legacyCredentialSet: 'legacy_credential_set'
  },

  imagePath: '//openagendatst.s3.amazonaws.com/',

  tests: {
    files: {
      tmpPath: '/var/tmp/',
      bucket: 'openagendatst',
      accessKeyId: '',
      secretAccessKey: ''
    },
    images: {
      tmpPath: '/var/tmp/'
    }
  },

  existingRoles: [ {
    value: 1,
    code: 'contributor'
  }, {
    value: 2,
    code: 'administrator'
  }, {
    value: 3,
    code: 'moderator'
  }, {
    value: 4,
    code: 'reader'
  } ],

  interfaces: {
    onCreate: agenda => {},
    onUpdate: ( before, after ) => {},
    beforeRemove: ( agenda, cb ) => { cb() },
    onRemove: agenda => {},
    imageFilesLoad: () => {},
    imageFilesClear: () => {},
    imageFilesGetBasePath: () => {}
  }

}

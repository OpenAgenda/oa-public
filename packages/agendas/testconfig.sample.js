"use strict";

module.exports = {
  
  mysql : {
    host : '127.0.0.1',
    database : 'agenda_test',
    password : 'yourpassword',
    user : 'yourdbuser'
  },

  schemas : {
    agenda: 'agenda',

    // used for detailed info gathering
    occurrence: 'occurrence',
    agendaEvent: 'agenda_event',

    // used for legacy data persistence
    legacyCredentialSet: 'legacy_credential_set'
  },

  files: {
    tmpPath: __dirname + '/test/tmp',
    bucket: 'thebucket',
    accessKeyId: 'thekeyid',
    secretAccessKey: 'thesecret'
  },

  imagePath: '//openagendatst.s3.amazonaws.com/',

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

    onRemove: agenda => {}

  },

  // dependency injection
  services: {
    
    // service in charge of handling and storing images
    images: {
      getPath: () => '/imagepath',
      getDefaultImagePath: () => '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',
      set: ( name, cb ) => cb( null, { name: 'nameoftheimage', path: 'pathoftheimage' }),
      remove: ( name, cb ) => cb( null )
    }

  }

}
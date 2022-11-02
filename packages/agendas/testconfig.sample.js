"use strict";

module.exports = {
  service: {

    mysql : {
      host : '127.0.0.1',
      database : 'agenda_test',
      password : 'grut',
      user : 'root',
      ssl: true
    },

    schemas : {
      agenda: 'agenda',
      occurrence: 'occurrence',
      agendaEvent: 'agenda_event'
    },

    imagePath: '//openagendatst.s3.amazonaws.com/',

    interfaces: {
      onCreate: agenda => {},
      onUpdate: ( before, after ) => {},
      beforeRemove: ( agenda, cb ) => { cb() },
      onRemove: agenda => {}
    }

  },

  dependencies: {
    files: {
      s3: {
        accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEV_REGION,
        defaultBucket: process.env.AWS_DEV_BUCKET
      },
      defaultProvider: 's3'
    }
  }
};

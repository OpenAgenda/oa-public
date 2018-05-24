"use strict";

const _ = require( 'lodash' );
const agendaDocx = require( 'agenda-docx' );
const cmn = require( '../lib/commons-app' );

module.exports = _.extend( ( parentApp, path ) => {

  parentApp.use( path + '/dist', agendaDocx.dist );

  parentApp.use( path + '/:agendaUid', cmn.verifyAdminModMiddleware( { uid: 'params.agendaUid' } ) );

  parentApp.use( path, agendaDocx.app );

}, { init } );


function init( config ) {

  agendaDocx.init( {
    s3: {
      region: 'eu-west-3',
      bucket: 'oa-docx',
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    queue: {
      namespace: 'docx',
      separator: ':',
      redis: {
        port: config.redis.port,
        host: config.redis.host
      }
    },
    localTmpPath: '/var/tmp'
  } );

}
"use strict";

const agendaDocx = require( '@openagenda/agenda-docx' );
const cmn = require( '../lib/commons-app' );

module.exports = app => {

  // not necessary
  app.use( '/docx/dist', agendaDocx.dist );

  app.use( '/docx/:agendaUid', cmn.verifyAdminModMiddleware( { uid: 'params.agendaUid' } ) );

  app.use( '/docx', agendaDocx.app );

};


module.exports.init = config => {

  agendaDocx.init( {
    logger: config.getLogConfig( 'svc', 'agenda-docx' ),
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

"use strict";

const homeMw = require( '@openagenda/home/middleware' );
const agendasSvc = require( 'agendas' );
const stakeholdersSvc = require( 'agenda-stakeholders' );
const eventsSvc = require( 'events-service' );


module.exports.init = ( config, cb ) => {

  homeMw.init( {
    mysql: config.db,
    schemas: config.schemas,
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    mw: {
      limit: 20
    },
    interfaces: {
      agendas: {
        list: agendasSvc.list
      },
      stakeholders: {
        list: ( userId, ...args ) => stakeholdersSvc.user( userId ).list( ...args )
      },
      events: {
        list: eventsSvc.list
      }
    }
  }, cb );

}
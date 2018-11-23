"use strict";

const { promisify } = require( 'util' );
const homeMw = require( '@openagenda/home/middleware' );
const agendasSvc = require( '@openagenda/agendas' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const eventsSvc = require( '@openagenda/events' );

const cmn = require( '../lib/commons-app' );


module.exports.init = async config => {

  await promisify( homeMw.init )( {
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
      agendaMailTo: cmn.agendaMailTo,
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
  } );

}

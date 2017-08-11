"use strict";

const agendaSearch = require( 'agenda-search' );

const agendas = require( 'agendas' ),

  logger = require( 'logger' );

module.exports.init = config => {

  agendaSearch.init( {
    schemas: config.schemas,
    elasticsearch: {
      host: `http://ns397902.ip-151-80-41.eu:${process.env.NODE_ENV==='production' ? 9200 : 9205}`,
      apiVersion: '5.3'
    },
    mw: {
      limit: {
        default: 20,
        max: 100
      }
    },
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    interfaces: {
      agendasList: ( offset, limit, cb ) => {

        agendas.list( { detailed: true }, offset, limit, ( err, agendas ) => {
        
          if ( err ) return cb( err );

          cb( null, agendas );

        } ); 

      }
    },
    logger,
    site: {
      url: config.root,
      image: config.logo
    }
  } );

}
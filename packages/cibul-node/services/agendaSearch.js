"use strict";

const agendaSearch = require( 'agenda-search' );

const agendas = require( 'agendas' ),

  logger = require( 'logger' );

module.exports.init = config => {

  agendaSearch.init( {
    services: {
      agendas
    },
    schemas: config.schemas,
    elasticsearch: {
      host: config.es.host + ':' + config.es.port,
      log: [ {
        type: 'stdio',
        level: [ 'error', 'warning' ]
      } ],
      apiVersion: '1.3',
      timeout: 30000
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
    logger,
    site: {
      url: config.root,
      image: config.logo
    }
  } );

}
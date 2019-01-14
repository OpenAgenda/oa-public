"use strict";

const aggregatorSources = require( '@openagenda/aggregator-sources' );
const agendas = require( '@openagenda/agendas' );

module.exports.init = config => {

  aggregatorSources.init( {
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
      getAgenda: ( identifiers, cb ) => {

        agendas.get( identifiers, { internal: true }, cb );

      }
    }
  } );

}

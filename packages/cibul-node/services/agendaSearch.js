"use strict";

const agendaSearch = require( '@openagenda/agenda-search' ),

  agendas = require( '@openagenda/agendas' ),

  agendaLocations = require( '@openagenda/agenda-locations' ),

  async = require( 'async' ),

  logger = require( '@openagenda/logger' );

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

        agendas.list( offset, limit, { detailed: true, indexed: true }, ( err, agendas ) => {

          async.eachSeries( agendas, ( agenda, ecb ) => {

            agenda.keywords = [];

            async.eachSeries( [ 'region', 'department', 'city' ], ( term, ecb2 ) => {

              agendaLocations.list.terms( [ term ], { agendaId: agenda.id }, ( err, result ) => {

                agenda.keywords = agenda.keywords.concat( result.map( r => r[ term ] ) );

                ecb2();

              } );

            }, ecb );            

          }, err => {

            cb( null, agendas );

          } );        

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
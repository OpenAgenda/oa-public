"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendaLocations = require( '@openagenda/agenda-locations' );
const agendaSearch = require( '@openagenda/agenda-search' );
const agendaSvc = require( '@openagenda/agendas' );

const listLocationTerms = promisify( agendaLocations.list.terms );

module.exports.init = config => {

  agendaSearch.init( {
    schemas: config.schemas,
    elasticsearch: {
      host: `${config.es53.host}:${config.es53.port}/`,
      apiVersion: '5.3'
    },
    mw: {
      limit: {
        default: 20,
        max: 100
      }
    },
    logger: config.getLogConfig( 'svc', 'agendaSearch' ),
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    interfaces: {
      list: async ( query, offset, limit, { detailed } ) => {

        const agendas = (
          await agendaSvc.list( query, offset, limit, { detailed: true, indexed: true } )
        ).agendas.map( a => _.assign( a, { keywords: [] } ) );

        if ( !detailed ) return agendas;

        for ( const agenda of agendas ) {

          await _decorateWithDetails( agenda );

        }

        return agendas;

      }
    },
    site: {
      url: config.root,
      image: config.logo
    }
  } );

}

async function _decorateWithDetails( agenda ) {

  agenda.keywords = [];

  for ( const term of [ 'region', 'department', 'city' ] ) {

    const result = await listLocationTerms( [ term ], { agendaId: agenda.id } );

    result.map( r => r[ term ] ).forEach( keyword => !agenda.keywords.includes( keyword ) ? agenda.keywords.push( keyword ) : null );

  }

  return agenda;

}

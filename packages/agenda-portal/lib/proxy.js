"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );
const qs = require( 'qs' );
const parseSearchQuery = require( './parsers/searchQuery' );

module.exports = ( { uid, key, eventsPerPage, defaultFilter } ) => {

  const limit = eventsPerPage || 20;

  const cached = _.memoize( _fetch, ( res, query ) => [ res, qs.stringify( query ) ].join( '|' ) );

  return {
    head: () => cached( 'settings.json' ).then( result => _.set( result, 'uid', uid ) ),
    list: cached.bind( null, 'events.json' ), // call comes with a query
    get
  }

  async function get( { uid, slug } ) {

    const query = { passed: 1 };

    if ( uid ) query.uids = [ uid ];

    if ( slug ) query.slug = slug;

    const result = await _fetch( 'events.json', { oaq: query } );

    return _.get( result.events, '0' );

  }

  function _fetch( res, query ) {

    const oaq = parseSearchQuery( _.get( query, 'oaq' ), { defaultFilter } );
    const page = _.get( query, 'page', 1 );

    const offset = ( parseInt( page ) - 1 ) * limit;

    return axios
      .get( `https://openagenda.com/agendas/${uid}/${res}`, {
        params: { key, oaq, limit, offset },
        paramsSerializer: params => qs.stringify( params, { arrayFormat: 'brackets' } )
      } ).then( res => res.data );

  }

}

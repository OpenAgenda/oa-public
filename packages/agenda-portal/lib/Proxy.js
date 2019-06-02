"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );
const qs = require( 'qs' );
const parseSearchQuery = require( './parsers/searchQuery' );
const log = require( './Log' )( 'proxy' );

module.exports = ( { uid, key, defaultLimit, defaultFilter } ) => {

  const cached = _.memoize( _fetch, ( res, query ) => [ res, qs.stringify( query ) ].join( '|' ) );

  return {
    head: () => cached( 'settings.json' ).then( result => _.set( result, 'uid', uid ) ),
    list: cached.bind( null, 'events.json' ), // call comes with a query
    clearCache,
    get,
    defaultLimit
  }

  function clearCache() {

    cached.cache.clear();

    log( 'cache is cleared' );

  }

  async function get( { uid, slug } ) {

    const query = { passed: 1 };

    if ( uid ) query.uids = [ uid ];

    if ( slug ) query.slug = slug;

    const result = await _fetch( 'events.json', { oaq: query }, 1 );

    return _.get( result.events, '0' );

  }

  function _fetch( res, query, forcedLimit = null ) {

    const oaq = parseSearchQuery( _.get( query, 'oaq' ), { defaultFilter } );

    const limit = forcedLimit || defaultLimit;

    const offset = parseInt( _.get( query, 'offset',
      // if page is given rather than offset, use that.
      ( parseInt( _.get( query, 'page', 1 ) ) - 1 ) * limit
    ) );

    log( 'fetching', { res, oaq, offset, limit });

    return axios
      .get( `https://openagenda.com/agendas/${uid}/${res}`, {
        params: { key, oaq, limit, offset },
        paramsSerializer: params => qs.stringify( params, { arrayFormat: 'brackets' } )
      } ).then( res => res.data );

  }

}

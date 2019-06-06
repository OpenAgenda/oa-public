"use strict";

const _ = require( 'lodash' );

const formatEvent = require( '@openagenda/legacy/rebuildSearchIndex/formatEvent' );

module.exports = ( { update, knex, imageBasePath } ) => {

  return async ( identifier, options = {} ) => {

    const { removeUnreferenced } = Object.assign( {
      removeUnreferenced: false
    }, options );

    const formatted = await formatEvent( { knex, imageBasePath }, identifier );

    if ( !_.get( formatted, 'articles', [] ).length && removeUnreferenced ) {
      return update( null );
    } else {
      return update( formatted );
    }

  }

}

"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'controlData/utils/setCategories' );

module.exports = async ( ctl, knex, agendaId ) => {

  const storeStr = _.get( await knex( 'category_set' ).first( 'store' ).where( 'id', agendaId ), 'store' );

  if ( !storeStr ) return;

  let store;

  try {

    store = JSON.parse( storeStr );

  } catch ( e ) {

    throw new VError( 'could not parse category set of agenda of id', agendaId, e );

  }

  ctl.ct = _.get( store, 'categories', [] ).map( c => ( { s: c.slug, c: c.label } ) );

}

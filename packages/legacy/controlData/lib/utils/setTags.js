"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'controlData/utils/setTags' );

module.exports = async ( ctl, knex, agendaId ) => {

  const storeStr = _.get( await knex( 'tag_set' ).first( 'store' ).where( 'id', agendaId ), 'store' );

  if ( !storeStr ) return;

  let store;

  try {

    store = JSON.parse( storeStr );

  } catch ( e ) {

    throw new VError( 'could not parse tag set of agenda of id', agendaId, e );

  }

  _.get( store, 'groups', [] ).forEach( ( g, i ) => {

    ctl.tg.push( g.name );

    g.tags.forEach( t => {

      ctl.t.push( {
        s: t.slug,
        t: t.label,
        g: i
      } );

    } );

  } );

}

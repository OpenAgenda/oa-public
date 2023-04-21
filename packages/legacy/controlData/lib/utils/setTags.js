"use strict";

const _ = require( 'lodash' );
const VError = require( '@openagenda/verror' );

const log = require( '@openagenda/logs' )( 'controlData/utils/setTags' );

module.exports = async ( ctl, knex, agendaId ) => {

  const storeStr = _.get( await knex( 'tag_set' ).first( 'store' ).where( 'id', agendaId ), 'store' );

  if ( !storeStr ) return;

  let store;

  try {

    store = JSON.parse( storeStr );

  } catch ( e ) {

    throw new VError( e, 'could not parse tag set of agenda of id', agendaId );

  }

  ctl.tg = [];
  ctl.t = [];

  _.get( store, 'groups', [] ).forEach( ( g, i ) => {
    if (['administrator', 'moderator'].includes(g.access)) {
      return;
    }

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

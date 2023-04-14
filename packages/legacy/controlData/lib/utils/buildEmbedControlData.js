"use strict";

const _ = require( 'lodash' );
const unserialize = require( 'locutus/php/var/unserialize' );
const VError = require( '@openagenda/verror' );

module.exports = async ( { knex, imagePath }, embedUid ) => {

  const store = await knex
    .first( 'store' )
    .from( 'review_embed' )
    .where( 'uid', embedUid )
    .then( r => r ? unserialize( r.store ) : null );

  if ( !store ) throw new VError( `no store was found for embed ${embedUid}` );

  const ebd = {
    md: _.get( store, 'layout.layoutmode', false ),
    sh: _.assign( {
      fb: true,
      tw: true,
      gp: true,
      li: true,
      tu: true,
      pi: true
    }, _.get( store, 'layout.shares', {} ) ),
    href: _.get( store, 'synchref', true ),
    ues: _.get( store, 'use_event_slug', false ),
    dcss: _.assign( {
      list: true,
      map: true,
      search: true,
      categories: true,
      tags: true,
      calendar: true,
      form: true
    }, _.get( store, 'layout.use_default_css', {} ) ),
    sc: _.get( store, 'layout.autoscroll', true ),
    mp: _.get( store, 'layout.mapPositionMode', 'all' ),
    mc: _.toPairs( _.get( store, 'layout.mapCorners', {} ) ).map( p => p[ 1 ] ).join( '|' ),
    ma: _.get( store, 'layout.mapAuto', false ),
    mt: _.get( store, 'layout.mapTiles', false ),
    classes: _.get( store, 'layout.catClasses', {} )
  };

  if ( _.get( store, 'layout.mapIcons' ) ) {

    ebd.mi = {
      a: _.get( store, 'layout.mapIcons.active' ) ? imagePath + _.get( store, 'layout.mapIcons.active' ) : false,
      i: _.get( store, 'layout.mapIcons.inactive' ) ? imagePath + _.get( store, 'layout.mapIcons.inactive' ) : false
    };

    ebd.ms = {
      a: _.get( store, 'layout.mapIconSizes.active', false ),
      i: _.get( store, 'layout.mapIconSizes.inactive', false )
    };

  }

  return ebd;

}

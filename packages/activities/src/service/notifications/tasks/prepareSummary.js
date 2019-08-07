"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const log = require( '@openagenda/logs' )( 'activities/notifications/tasks/prepareSummary' );

module.exports = async function prepareSummary( config ) {

  const { service, knex } = config;

  _traverseTable(
    knex,
    config.schemas.feed_notification,
    q => q.select(
      config.schemas.feed_notification + '.*',
      config.schemas.feed + '.entity_type',
      config.schemas.feed + '.entity_uid'
    )
      .where( { state: 0, sent: 0 } )
      .groupBy( 'feed_id' )
      .orderBy( 'updated_at', 'desc' )
      .join( config.schemas.feed, config.schemas.feed_notification + '.feed_id', config.schemas.feed + '.id' ),
    async ( item, index, cb ) => {

      let notifications = await knex( config.schemas.feed_notification ).select()
        .where( { feed_id: item.feed_id, state: 0, sent: 0 } )
        .andWhere( 'id', '>=', item.id )
        .orderBy( 'updated_at', 'desc' );

      notifications = notifications.map( notif => {

        notif = _.mapKeys( notif, ( value, key ) => _.camelCase( key ) );
        notif.store = JSON.parse( notif.store || '{}' );

        return notif;

      } );

      const { getUser, isUnsubscribed } = config.interfaces;

      const user = await getUser( item.entity_uid );

      if ( !user ) {
        return cb();
      }

      try {
        if ( !await isUnsubscribed( user.uid ) ) {
          service.tasks.notifications.sendSummary( { user, notifications } );
        }

        cb();
      } catch ( e ) {
        return cb( e );
      }

    },
    ( err, rowsAffected ) => {

      if ( err ) return log( 'error', err );

    }
  );

}

function _traverseTable( knex, table, queryModifier, eachCb, cb ) {

  let rowsCount = 0;
  let rowsAffected = 0;

  async.doWhilst(
    dcb => {

      const query = knex( table ).offset( rowsAffected ).limit( 100 );

      queryModifier( query )
        .then( rows => {

          rowsCount = rows.length;
          rowsAffected += rows.length;

          if ( !rows.length ) return dcb();

          async.eachOfSeries( rows, ( item, i, ecb ) => {
            eachCb( item, rowsAffected - rows.length + Number.parseInt( i ), ecb );
          }, dcb );

        } );

    },
    () => rowsCount > 0,
    err => {

      cb( err, rowsAffected );

    }
  );

}

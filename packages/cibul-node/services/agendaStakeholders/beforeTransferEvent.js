"use strict";

const users = require( 'users' ),

  activities = require( 'activities' ),

  VError = require( 'verror' );

let log = console.log;

module.exports = function ( eventUid, ownerId, nextOwnerId, cb ) {

  users.get( ownerId, ( err, ownerUser ) => {

    if ( err ) return cb( err );

    if ( !ownerUser ) {

      return cb( new VError( 'previous owner not found ( id: %s )', ownerUser ) );

    }

    users.get( nextOwnerId, ( err, nextOwnerUser ) => {

      if ( err ) return cb( err );

      if ( !nextOwnerUser ) {

        return cb( new VError( 'next owner not found ( id: %s )', nextOwnerId ) );

      }

      let feed = activities.feed( { entityType: 'user', entityUid: ownerUser.uid } );

      feed.get().then( data => {

        return data ? feed : null;

      } )

      .then( feed => {

        if ( !feed ) return cb();

        feed.unfollow( { entityType: 'event', entityUid: eventUid }, err => {

          if ( err ) {

            log( 'error', err );
            return cb( err );

          }

          activities.feed( { entityType: 'user', entityUid: nextOwnerUser.uid } )

            .follow( { entityType: 'event', entityUid: eventUid }, err => {

              if ( err ) {

                log( 'error', err );
                return cb( err );

              }

              cb();

            } );

        } );

      } );

    } );

  } );

}

module.exports.setLog = l => log = l;
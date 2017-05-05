"use strict";

const users = require( 'users' ),

  activities = require( 'activities' );

let log = console.log;

function beforeTransferEvent( eventUid, ownerId, nextOwnerId, cb ) {

  users.get( ownerId, ( err, ownerUser ) => {

    if ( err ) return cb( err );

    users.get( nextOwnerId, ( err, nextOwnerUser ) => {

      if ( err ) return cb( err );

      activities.feed( { entityType: 'user', entityUid: ownerUser.uid } )
        .unfollow( { entityType: 'event', entityUid: eventUid }, err => {

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

}

module.exports.setLog = l => log = l;
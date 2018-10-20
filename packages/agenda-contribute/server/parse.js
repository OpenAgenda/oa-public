"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

/**
 * Event service follows a deep schema that form-schema cannot emulate. 
 * In particular, image information is stored in an image key in the event service event
 * whereas it is dispatched at the root of the object for the form schema event
 *
 * These functions allow parsing from one format to the other
 */

module.exports = {
  fromEventServiceFormat,
  toEventServiceFormat
}


function fromEventServiceFormat( eventServiceEvent ) {

  if ( !eventServiceEvent ) return null;

  const update = {
    image: { $unset: [ 'credits' ] }
  };

  if ( _.get( eventServiceEvent, 'image.credits' ) ) {

    update[ 'imageCredits' ] = { $set: _.get( eventServiceEvent, 'image.credits' ) };

  }

  if ( !_.get( eventServiceEvent, 'image.filename' ) ) {

    update[ 'image' ] = { $set: null };

  }

  return ih( eventServiceEvent, update );

}

function toEventServiceFormat( formSchemaEvent, files = {} ) {

  if ( !formSchemaEvent ) return null;

  const update = { 
    '$unset': [ 'imageCredits' ] 
  };


  // new image is loaded
  if ( _.get( files, 'image.path' ) ) {

    update.image = {
      $set: {
        path: _.get( files, 'image.path' ),
        credits: _.get( formSchemaEvent, 'imageCredits' )
      }
    };

  // image has been removed
  } else if ( !formSchemaEvent.image ) {

    update[ '$unset' ].push( 'image' );

  // image is maintained
  } else {

    update.image = { credits: { $set: _.get( formSchemaEvent, 'imageCredits' ) } };

  }

  return ih( formSchemaEvent, update );

}

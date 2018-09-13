"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setEvent' );

const core = require( '../../../core' );

const config = require( '../../../config' );

module.exports = async ( agenda, user, current, data, files ) => {

  //IAMHERE - apparently, when event is untouched and saved, values are not posted

  log( 'current is %s', current ? 'set, this is an update.' : 'not set, this is a create' );

  const transforms = { '$unset': [] };

  // image  

  if ( _.get( files, 'image.path' ) ) { // this cannot work if image is not provided in files.

    transforms.image = { 
      $set: { 
        path: _.get( files, 'image.path' )
      } 
    };

  } else {

    transforms[ '$unset' ].push( 'image' );

  }

  
  // for a new event, the owner and origin agenda must be specified

  if ( !current ) {

    _.assign( transforms, {
      ownerUid: { $set: user.uid },
      creatorUid: { $set: user.uid },
      agendaUid: { $set: agenda.uid }
    } );

  }

  const transformed = ih( data, transforms );

  if ( !current ) {

    log( 'creating event' );

    const result = await core.agendas( agenda.uid ).events.create( transformed );

    return { event: result.created.event };

  } else {

    log( 'updating event' );

    try {

      const result = await core.agendas( agenda.uid ).events.update( current.uid, transformed );

      return { event: result.updated.event };

    } catch ( e ) {

      //IAMHERE, validation errors should be array!

      if ( _.isArray( e ) ) {

        log( 'error', 'validation errors', e );

      } else {

        log( 'error', e.valueOf );

      }

      return {
        event: null
      }

    }

  }

}

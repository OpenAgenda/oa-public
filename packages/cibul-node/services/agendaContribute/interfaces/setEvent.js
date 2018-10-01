"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setEvent' );

const core = require( '../../../core' );

const config = require( '../../../config' );

module.exports = async ( agenda, user, current, data, files, options = {} ) => {

  const { draft } = _.assign( {
    draft: false
  }, options );

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

  if ( !current || current.draft ) {

    _.assign( transforms, {
      ownerUid: { $set: user.uid },
      creatorUid: { $set: user.uid },
      agendaUid: { $set: agenda.uid },
      canEdit: { $set: true }
    } );

  }


  // event state is dictated by agenda settings
  transforms[ 'state' ] = { $set: _.get( agenda, 'settings.contribution.defaultState' ) };

  const transformed = ih( data, transforms );

  if ( !current ) {

    log( draft ? 'creating draft' : 'creating event' );

    const result = await core.agendas( agenda.uid ).events.create( transformed, {
      draft,
      context: {
        userUid: user.uid
      }
    } );

    return { event: result.created.event };

  } else {

    log( draft ? 'updating draft' : 'updating event' );

    try {

      const result = await core.agendas( agenda.uid ).events.update( current.uid, transformed, { 
        draft,
        context: {
          userUid: user.uid
        }
      } );

      return { event: result.updated.event };

    } catch ( e ) {

      //IAMHERE, validation errors should be array! see notes.txt for more things

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

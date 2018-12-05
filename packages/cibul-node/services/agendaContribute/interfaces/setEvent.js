"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setEvent' );

const core = require( '../../../core' );

const config = require( '../../../config' );

module.exports = async ( agenda, user, current, data, options = {} ) => {

  const { draft } = _.assign( {
    draft: false
  }, options );

  log( 'current is %s', current ? 'set, this is an update.' : 'not set, this is a create' );

  const transforms = { '$unset': [] };

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
  transforms.state = { $set: _.get( agenda, 'settings.contribution.defaultState' ) };

  const transformed = ih( data, transforms );

  try {

    if ( !current ) {

      log( draft ? 'creating draft' : 'creating event' );

      const result = await core.agendas( agenda.uid ).events.create( transformed, {
        draft,
        formSchemaDataFormat: true,
        context: {
          userUid: user.uid
        }
      } );

      return { event: result.created.event };

    } else {

      log( draft ? 'updating draft' : 'updating event' );

      const result = await core.agendas( agenda.uid ).events.update( current.uid, transformed, {
        draft,
        formSchemaDataFormat: true,
        context: {
          userUid: user.uid
        }
      } );

      return {
        event: _.get( result, 'updated.event' ),
        success: result.success
      };

    }

  } catch ( e ) {

    if ( e.name === 'validationError' ) {

      log( 'error', 'validation errors', e.jse_info.errors );

      return {
        success: false,
        errors: e.jse_info.errors,
        event: null
      }

    };

    log( 'error', e );

    return {
      success: false,
      event: null
    }

  }

}

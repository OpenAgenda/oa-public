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

  const isNew = !current;
  const isDraft = _.get( current, 'draft', false );
  const isUndrafted = isDraft && !draft;

  log( isNew ? 'this is a create' : 'this is an update.' );

  const transforms = { '$unset': [] };

  // for a new event, the owner and origin agenda must be specified

  if ( isNew || isDraft ) {

    _.assign( transforms, {
      ownerUid: { $set: user.uid },
      creatorUid: { $set: user.uid },
      agendaUid: { $set: agenda.uid },
      canEdit: { $set: true }
    } );

  }

  // define which state the event should take

  if ( !isNew && !isDraft && _.get( agenda, 'settings.contribution.moderateOnChangeBy', [] ).length ) {

    log( 'event is not new and not a draft and should be moderated on change' );

    transforms.state = { $set: 0 };

  } else if ( isNew || isUndrafted ) {

    log( 'event is new or undrafted; it should take the state requested by the agenda' );

    transforms.state = { $set: _.get( agenda, 'settings.contribution.defaultState' ) };

  } else {

    log( 'event is not new or is a draft. State should not be set' );

    transforms[ '$unset' ].push( 'state' );

  }

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


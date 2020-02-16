"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setEvent' );

const config = require( '../../../config' );

module.exports = async (services, agenda, user, current, data, options = {}) => {
  const {
    core,
    members
  } = services;

  const { draft } = Object.assign({
    draft: false
  }, options);

  const isNew = !current;
  const isDraft = _.get(current, 'draft', false);
  const isUndrafted = isDraft && !draft;

  log(isNew ? 'this is a create' : 'this is an update.');

  const transforms = { '$unset': [] };

  // for a new event, the owner and origin agenda must be specified

  if (isNew || isDraft) {
    Object.assign(transforms, {
      ownerUid: { $set: user.uid },
      creatorUid: { $set: user.uid },
      agendaUid: { $set: agenda.uid },
      canEdit: { $set: true }
    });
  }

  // define which state the event should take

  if (!isNew && !isDraft && await _shouldBeModerated(members, agenda, user)) {
    log('event is not new and not a draft and should be moderated on change');

    transforms.state = { $set: 0 };
  } else if (isNew || isUndrafted) {
    log( 'event is new or undrafted; it should take the state requested by the agenda' );

    transforms.state = { $set: _.get(agenda, 'settings.contribution.defaultState') };
  } else {

    log('event is not new or is a draft. State should not be set');

    transforms['$unset'].push('state');
  }

  const transformed = ih(data, transforms);

  try {
    if (!current) {
      log(draft ? 'creating draft' : 'creating event');

      const event = await core.agendas(agenda.uid).events.create(transformed, {
        draft,
        formSchemaDataFormat: true,
        context: {
          userUid: user.uid
        }
      });

      return {
        event
      };
    } else {
      log(draft ? 'updating draft' : 'updating event');

      const event = await core.agendas(agenda.uid).events.update(current.uid, transformed, {
        draft,
        formSchemaDataFormat: true,
        context: {
          userUid: user.uid
        }
      });

      return {
        event,
        success: true
      };
    }
  } catch (e) {
    if (e.name === 'ValidationError') {
      log('error', 'validation errors', e.detail);

      return {
        success: false,
        errors: e.detail,
        event: null
      }
    };

    log('error', e);

    return {
      success: false,
      event: null
    }
  }
}

async function _shouldBeModerated(members, agenda, user) {

  try {

    const shouldBeModeratedCodes = _.get(
      agenda,
      'settings.contribution.moderateOnChangeBy',
      []
    ).map( members.utils.getRoleCode );

    if ( !shouldBeModeratedCodes.length ) return false;

    const member = await members.get( {
      agendaUid: agenda.uid,
      userUid: user.uid
    } );

    if ( !member ) throw new Error( 'Member not found' );

    return shouldBeModeratedCodes.includes( member.role );

  } catch ( e ) {

    log( 'error', 'Could not determine role of user %s in agenda %s', user.uid, agenda.uid, e );

    return true;

  }

}

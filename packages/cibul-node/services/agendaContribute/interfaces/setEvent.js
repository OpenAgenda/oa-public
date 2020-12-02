'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const log = require('@openagenda/logs')('services/agendaContribute/interfaces/setEvent');

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

  const coreOptions = {
    draft,
    formSchemaDataFormat: true,
    context: {
      userUid: user.uid
    },
    access: await _getMemberRoleSlug(members, agenda, user) || 'public'
  };

  const transformed = ih(data, transforms);

  try {
    if (!current) {
      log(draft ? 'creating draft' : 'creating event');
      return {
        event: await core.agendas(agenda.uid).events.create(transformed, coreOptions)
      };
    } else {
      log(draft ? 'updating draft' : 'updating event');
      return {
        event: await core.agendas(agenda.uid).events.update(current.uid, transformed, coreOptions),
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

async function _getMemberRoleSlug(members, agenda, user) {
  const member = await members.get({
    agendaUid: agenda.uid,
    userUid: user.uid
  });

  return member ? members.utils.getRoleSlug(member.role) : null;
}

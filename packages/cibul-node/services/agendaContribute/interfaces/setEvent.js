'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const log = require('@openagenda/logs')('services/agendaContribute/interfaces/setEvent');

module.exports = async (services, agenda, user, current, data, options = {}) => {
  const {
    core
  } = services;

  const { draft } = {
    draft: false,
    ...options
  };

  log(!current ? 'this is a create' : 'this is an update');

  try {
    if (!current) {
      log(draft ? 'creating draft' : 'creating event');
      return {
        event: await core.agendas(agenda.uid).events.create(data, {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true
        })
      };
    } else {
      log(draft ? 'updating draft %s' : 'updating event %s', current.uid);
      return {
        event: await core.agendas(agenda.uid).events.patch(current.uid, data, {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true
        }),
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
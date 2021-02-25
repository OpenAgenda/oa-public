'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const log = require('@openagenda/logs')('services/agendaContribute/interfaces/setEvent');

module.exports = async (services, agenda, user, current, data, options = {}) => {
  // req.mode est dispo ici
  const {
    core
  } = services;

  const { draft, mode, fromAgenda } = {
    draft: false,
    mode: 'create',
    fromAgenda: null,
    ...options
  };

  try {
    if (mode === 'create') {
      log(draft ? 'creating draft' : 'creating event');
      return {
        event: await core.agendas(agenda.uid).events.create(data, {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true
        })
      };
    } else if (mode === 'edit') {
      log(draft ? 'updating draft %s' : 'updating event %s', current.uid);
      return {
        event: await core.agendas(agenda.uid).events.patch(current.uid, data, {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true
        }),
        success: true
      };
    } else if (mode === 'add') {
      log('adding event %s to agenda %s', current.uid, agenda.uid);
      return {
        event: await core.agendas(agenda.uid).events.add(current.uid, data, {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true,
          sourceAgenda: fromAgenda
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
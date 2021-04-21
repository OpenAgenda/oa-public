'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const log = require('@openagenda/logs')('services/agendaContribute/interfaces/setEvent');

module.exports = async (services, req, data) => {
  const {
    core
  } = services;

  const {
    draft,
    mode,
    event: current,
    fromAgenda,
    agenda,
    user
  } = req;

  log('setEvent with draft %s, mode %s, fromAgenda %s', draft ? 'true' : 'false', mode, fromAgenda ? fromAgenda?.uid : 'not set');

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
      const undrafting = current?.draft && !draft;
      // distinction is important as an undrafting
      // needs a complete update to force hidden default values
      log('%s event %s', undrafting ? 'undrafting' : 'updating', current.uid);

      return {
        event: await core.agendas(agenda.uid).events[undrafting ? 'update' : 'patch'](current.uid, data, {
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
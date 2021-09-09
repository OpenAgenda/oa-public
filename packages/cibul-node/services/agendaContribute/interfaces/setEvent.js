'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/setEvent');

const filterByAuth = require('../lib/filterByAuthorizations');

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
      log(draft ? 'creating draft with %j' : 'creating event with %j', data);
      return {
        event: await core.agendas(agenda.uid).events.create(data, {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true
        })
      };
    }
    if (mode === 'edit') {
      const undrafting = current?.draft && !draft;
      // distinction is important as an undrafting
      // needs a complete update to force hidden default values
      log('%s event %s', undrafting ? 'undrafting' : 'updating', current.uid);

      return {
        event: await core.agendas(agenda.uid).events[undrafting ? 'update' : 'patch'](current.uid, filterByAuth(core, req.agenda.uid, req.authorizations, data), {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true
        }),
        success: true
      };
    }
    if (mode === 'add') {
      log('adding event %s to agenda %s', current.uid, agenda.uid);
      return {
        event: await core.agendas(agenda.uid).events.add(current.uid, filterByAuth(core, req.agenda.uid, req.authorizations, data), {
          draft,
          userUid: user.uid,
          filterUnauthorizedData: true,
          sourceAgenda: fromAgenda
        }),
        success: true
      };
    }
  } catch (e) {
    if (e.name === 'BadRequest') {
      log('error', 'validation errors', e.info);

      return {
        success: false,
        errors: e.info,
        event: null
      };
    }

    log('error', e);

    return {
      success: false,
      event: null
    };
  }
};

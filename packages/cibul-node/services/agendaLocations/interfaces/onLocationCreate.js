'use strict';

const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaLocations/onLocationCreate');
const createLocationFeeds = require('../lib/createLocationFeeds');

module.exports = services => async (location, context = {}) => {
  const { core, activities, members } = services;
  const { agendaUid, setUid } = context;

  try {
    await createLocationFeeds(services, { agendaUid, setUid, locationUid: location.uid });
  } catch (e) {
    return log.error(new VError(e, 'Cannot create location feeds', { agendaUid, setUid, locationUid: location.uid }));
  }

  // Add activity
  try {
    let agenda;
    let member;

    try {
      member = await members.get({
        agendaUid: context.agendaUid,
        userUid: context.userUid,
      }, { detailed: true });
    } catch (e) {
      return log('error', new VError(e, 'Error to get member', {
        agendaUid: context.agendaUid,
        userUid: context.userUid,
      }));
    }

    try {
      agenda = await core.agendas(context.agendaUid).get({ access: 'internal' });
    } catch (e) {
      return log('error', new VError(e, 'Error to get agenda', context.agendaUid));
    }

    await activities.addActivity({
      entityType: 'location',
      entityUid: location.uid,
    }, {
      actor: `user:${context.userUid}`,
      verb: 'location.create',
      object: `location:${location.uid}`,
      target: `agenda:${agendaUid}`,
      store: {
        labels: {
          actor: member.name ?? member.custom?.contactName ?? member.user.fullName,
          object: location.name,
          target: agenda.title,
        },
        setUid,
      },
    });
  } catch (e) {
    log('error', 'failed to create location create activity', e);
  }
};

import logs from '@openagenda/logs';

const log = logs('core/agendas/events/setByExtId');

export default async (core, agendaUid, key, value, data, options = {}) => {
  log('info', 'getting', { agendaUid, extId: { key, value } });

  const extId = { key, value };

  const { mergeExtIds } = { mergeExtIds: true, ...options };
  try {
    const event = await core
      .agendas(agendaUid)
      .events.search.get({ extId }, options.context);
    if (event) {
      log('info', 'updating', { agendaUid, extId });
      const updatedEvent = await core
        .agendas(agendaUid)
        .events.update(
          event.uid,
          { ...data, extIds: [extId] },
          { ...options, mergeExtIds },
        );
      return updatedEvent;
    }
  } catch (error) {
    if (error.message === 'event not found') {
      log('info', 'creating', { agendaUid, extId });
      const createdEvent = await core
        .agendas(agendaUid)
        .events.create({ ...data, extIds: [extId] }, options);
      return createdEvent;
    }
    throw error;
  }
};

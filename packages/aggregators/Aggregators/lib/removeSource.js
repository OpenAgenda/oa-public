'use strict';

module.exports = async ({
  getAgendaSourceId,
  removeSourceEntry,
  enqueueLoadSourceRemoves
}, aggregatorAgenda, sourceAgenda) => {
  if (!await getAgendaSourceId(sourceAgenda, aggregatorAgenda)) {
    throw new Error('Agenda is not source');
  }

  await removeSourceEntry(aggregatorAgenda, sourceAgenda);

  return enqueueLoadSourceRemoves({
    aggregatorAgendaUid: aggregatorAgenda.uid,
    sourceAgendaUid: sourceAgenda.uid
  });
}

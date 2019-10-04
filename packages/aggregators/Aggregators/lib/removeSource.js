'use strict';

module.exports = async ({
  isAgendaSource,
  removeSourceEntry,
  enqueueLoadSourceRemoves
}, aggregatorAgenda, sourceAgenda) => {
  if (!await isAgendaSource(sourceAgenda, aggregatorAgenda)) {
    throw new Error('Agenda is not source');
  }

  await removeSourceEntry(aggregatorAgenda, sourceAgenda);

  return enqueueLoadSourceRemoves({
    aggregatorAgendaUid: aggregatorAgenda.uid,
    sourceAgendaUid: sourceAgenda.uid
  });
}

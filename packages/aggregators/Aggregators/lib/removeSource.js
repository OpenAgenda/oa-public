'use strict';

module.exports = async ({
  removeSourceEntry,
  getSourceEntry,
  enqueueLoadSourceRemoves
}, aggregatorAgenda, sourceId, options = {}) => {
  const {
    evaluate
  } = {
    evaluate: false,
    ...options
  }

  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    throw new Error('No source was found');
  }

  await removeSourceEntry(aggregatorAgenda, source.agenda);

  if (evaluate) {
    return enqueueLoadSourceRemoves({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      sourceAgendaUid: source.agenda.uid
    });
  }
}

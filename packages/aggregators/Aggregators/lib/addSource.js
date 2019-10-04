'use strict';

module.exports = async ({
  isAgendaSource,
  addSourceEntry,
  getMergedSchema,
  enqueueLoadSourceEvaluates
}, aggregatorAgenda, sourceAgenda) => {
  if (await isAgendaSource(sourceAgenda, aggregatorAgenda)) {
    throw new Error('Agenda is already source');
  }

  const {
    aggregator,
    source
  } = await addSourceEntry(aggregatorAgenda, sourceAgenda);

  return enqueueLoadSourceEvaluates({
    aggregatorAgendaUid: aggregatorAgenda.uid,
    aggregator,
    sourceAgenda,
    source,
    formSchema: await getMergedSchema(sourceAgenda.uid)
  });
}

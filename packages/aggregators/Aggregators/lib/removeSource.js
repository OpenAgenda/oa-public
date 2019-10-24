'use strict';

const Log = require('../utils/Log')('Aggregators/removeSource');

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

  const log = Log(`removing source ${sourceId} from aggregator ${aggregatorAgenda.slug}`);

  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('no source was found, throwing error');
    throw new Error('No source was found');
  }

  await removeSourceEntry(aggregatorAgenda, source.agenda);

  if (evaluate) {
    log('source removed, evaluating');
    return enqueueLoadSourceRemoves({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      sourceAgendaUid: source.agenda.uid
    });
  }
  log('source removed, not evaluating');
}

'use strict';

const Log = require('../utils/Log')('Aggregators/removeEvent');

const paths = require('../utils/paths');

const processRemove = async (
  { getEventReference, updateSourcePaths, unreferenceEvent },
  { sourceAgendaUid, event, batched, aggregatorAgendaUid, log },
) => {
  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  if (!reference) {
    log(`did not find reference in aggregator ${aggregatorAgendaUid}`);
    return { action: 'did not find reference in aggregator' };
  }

  const updatedPaths = paths.getFiltered(
    reference.sourcePaths,
    sourceAgendaUid,
  );

  if (reference.aggregated && !updatedPaths.length) {
    log(
      'no source references are left, event must be unlisted from aggregator agenda',
    );
    const { success, errors } = await unreferenceEvent(
      aggregatorAgendaUid,
      event.uid,
      { batched },
    );
    if (success) {
      log('removed reference');
      return { action: 'removed reference' };
    }
    log('failed to remove reference', errors);
    return { action: 'failed to remove reference', errors };
  }
  log(
    'other source references are present, current source ref must be removed',
  );
  await updateSourcePaths({
    aggregatorAgendaUid,
    eventUid: event.uid,
    paths: updatedPaths,
  });
  return { action: 'updateSourcePaths' };
};

const removeEvent = async (
  { getEventReference, updateSourcePaths, unreferenceEvent, enqueueRemove },
  data,
) => {
  const {
    aggregatorsBuffer,
    sourceAgendaUid,
    batched,
    report = { counts: {}, erroredEvents: [] },
    event,
  } = data;

  const log = Log(`${event.uid} of source ${sourceAgendaUid}`);

  if (aggregatorsBuffer.length === 0) {
    log('info', report);
    return;
  }
  log(`${aggregatorsBuffer.length} aggregators remaining to process`);
  const { aggregatorAgendaUid } = aggregatorsBuffer.shift();
  try {
    const { action, error = null } = await processRemove(
      {
        getEventReference,
        updateSourcePaths,
        unreferenceEvent,
      },
      {
        event,
        sourceAgendaUid,
        batched,
        aggregatorAgendaUid,
        log,
      },
    );

    report.counts[action] = (report.counts[action] ?? 0) + 1;
    if (error) {
      report.errors = (report.errors ?? 0) + 1;
      report.erroredEvents = (report.erroredEvents ?? []).concat(event.uid);
    }
  } catch (error) {
    log('error', error);
    report.errors = (report.errors ?? 0) + 1;
    report.erroredEvents = (report.erroredEvent ?? []).concat(event.uid);
  }
  await enqueueRemove({ ...data, report });
};

module.exports = {
  removeEvent,
  processRemove,
};

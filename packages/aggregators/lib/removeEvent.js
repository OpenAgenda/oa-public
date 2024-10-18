'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const log = logs('removeEvent');

const paths = require('../utils/paths');

const processRemove = async (
  { getEventReference, updateSourcePaths, unreferenceEvent },
  { sourceAgendaUid, event, batched, aggregatorAgendaUid },
) => {
  const logBundle = {
    aggregatorAgenda: { uid: aggregatorAgendaUid },
    sourceAgenda: { uid: sourceAgendaUid },
    event: _.pick(event, ['uid', 'slug']),
  };
  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  if (!reference) {
    log('did not find reference in aggregator', logBundle);
    return { action: 'did not find reference in aggregator' };
  }

  const updatedPaths = paths.getFiltered(
    reference.sourcePaths,
    sourceAgendaUid,
  );

  if (reference.aggregated && !updatedPaths.length) {
    log(
      'no source references are left, event must be unlisted from aggregator agenda',
      logBundle,
    );
    const { success, errors } = await unreferenceEvent(
      aggregatorAgendaUid,
      event.uid,
      { batched },
    );
    if (success) {
      log('removed reference', logBundle);
      return { action: 'removed reference' };
    }
    log('failed to remove reference', { ...logBundle, errors });
    return { action: 'failed to remove reference', errors };
  }
  log(
    'other source references are present, current source ref must be removed',
    logBundle,
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

  const logBundle = {
    event: _.pick(event, ['uid', 'slug']),
    sourceAgenda: { uid: sourceAgendaUid },
  };

  if (aggregatorsBuffer.length === 0) {
    log.info('done', { ...logBundle, report });
    return;
  }
  log.info('processing', { ...logBundle, remaining: aggregatorsBuffer.length });

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
    log.error('errored', { ...logBundle, error });
    report.errors = (report.errors ?? 0) + 1;
    report.erroredEvents = (report.erroredEvent ?? []).concat(event.uid);
  }
  await enqueueRemove({ ...data, report });
};

module.exports = {
  removeEvent,
  processRemove,
};

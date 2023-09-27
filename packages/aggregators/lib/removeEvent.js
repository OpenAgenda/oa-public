'use strict';

const Log = require('../utils/Log')('Aggregators/removeEvent');

const paths = require('../utils/paths');

const processRemove = async ({
  getEventReference,
  updateSourcePaths,
  unreferenceEvent,
  sourceAgendaUid,
  batched,
  aggregator,
  dataReference,
}) => {
  const { aggregatorAgendaUid, eventUid } = aggregator;

  const log = Log(
    `event uid ${eventUid} of source agenda uid ${sourceAgendaUid} from aggregator agenda ${aggregatorAgendaUid}`,
  );

  const reference = dataReference || await getEventReference(aggregatorAgendaUid, eventUid);

  if (!reference) {
    log('did not find reference in aggregator');
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
      eventUid,
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
    eventUid,
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
    report = { counts: {}, erroredEventUids: [] },
  } = data;
  if (aggregatorsBuffer.length === 0) {
    const log = Log('no more items in aggregatorsBuffer');
    log.info(report);
    return;
  }
  const aggregator = aggregatorsBuffer.shift();
  try {
    const { action, error = null } = await processRemove({
      getEventReference,
      updateSourcePaths,
      unreferenceEvent,
      sourceAgendaUid,
      batched,
      aggregator,
      dataReference: data.reference,
    });
    report.counts[action] = (report.counts[action] ?? 0) + 1;
    if (error) {
      report.errors = (report.errors ?? 0) + 1;
      report.erroredEvents = (report.erroredEvent ?? []).concat([
        aggregator.eventUid,
      ]);
    }
  } catch (error) {
    report.errors = (report.errors ?? 0) + 1;
    report.erroredEvents = (report.erroredEvent ?? []).concat([
      aggregator.eventUid,
    ]);
  }
  await enqueueRemove({ ...data });
};

module.exports = {
  removeEvent,
  processRemove,
};

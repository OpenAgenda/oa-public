'use strict';

const Log = require('../utils/Log')('Aggregators/removeEvent');

const paths = require('../utils/paths');

module.exports = async (
  { getEventReference, updateSourcePaths, unreferenceEvent, enqueueRemove },
  data,
) => {
  const { aggregatorsBuffer, sourceAgendaUid, batched } = data;
  if (aggregatorsBuffer.length === 0) {
    Log('no more items in aggregatorsBuffer');

    return;
  }
  const aggregator = aggregatorsBuffer.shift();
  const { aggregatorAgendaUid, eventUid } = aggregator;

  const log = Log(
    `event uid ${eventUid} of source agenda uid ${sourceAgendaUid} from aggregator agenda ${aggregatorAgendaUid}`,
  );

  const reference = data.reference || await getEventReference(aggregatorAgendaUid, eventUid);

  if (!reference) {
    log('did not find reference in aggregator');
    await enqueueRemove({ aggregatorsBuffer, ...data });
    return;
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
      await enqueueRemove({ aggregatorsBuffer, ...data });
      return { success: true };
    }
    log('failed to remove reference', errors);
    await enqueueRemove({ aggregatorsBuffer, ...data });
    return { success: false, errors };
  }
  log(
    'other source references are present, current source ref must be removed',
  );
  await updateSourcePaths({
    aggregatorAgendaUid,
    eventUid,
    paths: updatedPaths,
  });
  await enqueueRemove({ aggregatorsBuffer, ...data });
};

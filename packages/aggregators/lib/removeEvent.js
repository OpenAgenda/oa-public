'use strict';

const Log = require('../utils/Log')('Aggregators/removeEvent');

const paths = require('../utils/paths');

module.exports = async ({
  getEventReference,
  updateSourcePaths,
  unreferenceEvent
}, data) => {
  const {
    aggregatorAgendaUid,
    sourceAgendaUid,
    eventUid,
    batched
  } = data;

  const log = Log(`event uid ${eventUid} of source agenda uid ${sourceAgendaUid} from aggregator agenda ${aggregatorAgendaUid}`);

  const reference = data.reference || await getEventReference(aggregatorAgendaUid, eventUid);

  if (!reference) {
    log('did not find reference in aggregator');
    return;
  }

  const updatedPaths = paths.getFiltered(reference.sourcePaths, sourceAgendaUid);

  let result;

  if (reference.aggregated && !updatedPaths.length) {
    log('no source references are left, event must be unlisted from aggregator agenda');
    const { success, errors } = await unreferenceEvent(aggregatorAgendaUid, eventUid, { batched });
    if (success) {
      log('removed reference');
      return { success: true };
    } else {
      log('failed to remove reference', errors);
      return { success: false, errors };
    }
  } else {
    log('other source references are present, current source ref must be removed');
    await updateSourcePaths(aggregatorAgendaUid, eventUid, updatedPaths);
  }
}

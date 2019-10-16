'use strict';

const log = require('@openagenda/logs')('Aggregators/removeEvent');

module.exports = async ({
  getEventReference,
  unsetSourceUidOnExistingReference,
  unreferenceEvent
}, data) => {
  const {
    aggregatorAgendaUid,
    sourceAgendaUid,
    eventUid,
    batched
  } = data;

  log('remove %s of source %s from %s', eventUid, sourceAgendaUid, aggregatorAgendaUid);

  const reference = data.reference || await getEventReference(aggregatorAgendaUid, eventUid);

  if (!reference) {
    log('did not find any reference of event %s to remove from aggregator %s', eventUid, aggregatorAgendaUid);
    return;
  }

  log('reference sources: %j', reference.sourceAgendaUid);

  const update = reference.sourceAgendaUid.filter(uid => uid!==sourceAgendaUid);

  if (reference.aggregated && !update.length) {
    log('no source references are left, event must be unlisted from aggregator agenda');
    await unreferenceEvent(sourceAgendaUid, aggregatorAgendaUid, eventUid, { batched });
  } else {
    log('other source references are present, current source ref must be removed');
    await unsetSourceUidOnExistingReference(aggregatorAgendaUid, eventUid, sourceAgendaUid);
  }
}

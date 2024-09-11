import _ from 'lodash';
import logs from '@openagenda/logs';
import ih from 'immutability-helper';

const log = logs('set');

function _merge(options, operation) {
  const override = _.get(options, operation);

  if (!override) return options;

  const updateObj = _.mapValues(override, (v) => ({ $set: v }));

  updateObj.$unset = [operation];

  return ih(options, updateObj);
}

export default async (
  service,
  agendaUid,
  eventUid,
  data = {},
  options = {},
) => {
  const { get, update, create } = service;

  log('info', 'initiating set', { agendaUid, eventUid, data });

  if (await get(agendaUid, eventUid)) {
    const result = await update(
      agendaUid,
      eventUid,
      _merge(data, 'update'),
      _merge(options, 'update'),
    );

    if (!result.success) return result;

    return _.assign(_.omit(result, 'updated'), {
      set: result.updated,
    });
  }

  const result = await create(
    agendaUid,
    eventUid,
    _merge(data, 'create'),
    _merge(options, 'create'),
  );

  if (!result.success) return result;

  return Object.assign(_.omit(result, 'created'), {
    set: result.created,
  });
};

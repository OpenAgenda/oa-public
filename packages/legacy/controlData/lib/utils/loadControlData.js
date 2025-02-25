import _ from 'lodash';
import logs from '@openagenda/logs';
import initializeControlData from './initializeControlData.js';

const log = logs('controlData/loadAgendaControlData');

export default async (redis, prefix, agendaUid, options = {}) => {
  const { parse, initialize } = _.assign(
    { parse: true, initialize: false },
    options,
  );

  const ctlDataStr = await redis.get(prefix + agendaUid);

  const isNotDefined = !ctlDataStr || ctlDataStr === 'null';

  if (isNotDefined && !initialize) {
    return null;
  }
  if (isNotDefined && !parse) {
    return JSON.stringify(initializeControlData());
  }
  if (isNotDefined) {
    return initializeControlData();
  }
  if (!parse) {
    return ctlDataStr;
  }

  try {
    return JSON.parse(ctlDataStr);
  } catch (e) {
    log(
      'error',
      'could not parse control data of agenda %s: %s',
      agendaUid,
      ctlDataStr,
    );
  }

  return initializeControlData();
};

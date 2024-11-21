import _ from 'lodash';
import logs from '@openagenda/logs';
import parseLocation from './parseLocation.js';

const log = logs('controlData/utils/setLocationReference');

export default (ctlData, location) => {
  if (!ctlData) {
    log('warn', 'control data object is not initialized');
    return null;
  }

  const index = _.findIndex(ctlData.l, { u: location.uid });

  const parsed = parseLocation(location);

  if (index === -1) {
    ctlData.l.push(parsed);
  } else {
    ctlData.l[index] = parsed;
  }

  return parsed;
};

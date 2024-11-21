import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('controlData/utils/verifyAndRemoveLocation');

/**
 * verify if location associated to event of index eventIndex is referenced
 * by other event. If it is not, remove it from location list
 */
export default (ctlData, eventIndex) => {
  const locationUid = ctlData.ev[eventIndex].l;

  for (let cursor = 0; cursor < ctlData.ev.length; cursor++) {
    if (cursor === eventIndex) continue;

    if (ctlData.ev[cursor].l === locationUid) return null;
  }

  // if we are here, no other event referencing location uid was found
  const locationIndex = _.findIndex(ctlData.l, { u: locationUid });

  if (locationIndex === -1) {
    log(
      'warn',
      'location %s was not found in control data location index',
      locationUid,
    );

    return null;
  }

  // const location = ctlData.l[locationIndex];

  return _.first(ctlData.l.splice(locationIndex, 1));
};

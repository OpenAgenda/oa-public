import _ from 'lodash';
import ih from 'immutability-helper';
import moment from 'moment';
import { getValue as getBeginValue } from './begin.js';

function _appendLabel(timing, { lang }) {
  return Object.assign(timing, {
    label: _.capitalize(moment(getBeginValue(timing)).locale(lang).fromNow()),
  });
}

// assumes timings are sorted
export default (event, { lang }) => {
  if (!event.timings || !event.timings.length) {
    return event;
  }

  const last = event.timings.slice(-1)[0];
  const now = new Date();

  const update = {
    lastTiming: { $set: _appendLabel(last, { lang }) },
    nextTiming: { $set: null },
  };

  if (last && new Date(last.end) < now) {
    // if last is in the past, there is no next timing

    return ih(event, update);
  }

  for (const t of event.timings) {
    // go through timings, keep the first one that finishes in the future
    if (new Date(t.end) > now) {
      update.nextTiming = { $set: _appendLabel(t, { lang }) };

      break;
    }
  }

  return ih(event, update);
};

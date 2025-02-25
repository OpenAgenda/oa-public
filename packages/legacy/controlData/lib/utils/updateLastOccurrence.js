import _ from 'lodash';

export default (controlData, timings = []) => {
  const lastTimings = _.last(timings);

  const current = controlData.lo
    ? {
      start: new Date(controlData.lo.start),
      end: new Date(controlData.lo.end),
    }
    : null;

  if (!current || current.start < new Date(lastTimings.begin)) {
    controlData.lo = {
      start: lastTimings.begin,
      end: lastTimings.end,
    };
  }
};

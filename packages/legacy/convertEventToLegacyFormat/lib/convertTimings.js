import moment from 'moment-timezone';

export default (timings) => {
  if (!Array.isArray(timings)) {
    return timings;
  }

  return timings.map((timing) => {
    const start = moment(timing.begin).toISOString();
    const end = moment(timing.end).toISOString();
    return { start, end };
  });
};

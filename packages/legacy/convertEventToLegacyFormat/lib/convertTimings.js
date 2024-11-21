import moment from 'moment-timezone';

export default (timings) =>
  timings.map((timing) => {
    const start = moment(timing.begin).toISOString();
    const end = moment(timing.end).toISOString();
    return { start, end };
  });

import getTimings from './getTimings.mjs';

export default instance => {
  const now = new Date();

  const min = [false, false]; // past / upcoming

  getTimings(instance).forEach(timing => {
    const end = new Date(timing.end);

    const start = new Date(timing.start);

    if (end < now) {
      // past

      if (!min[0] || (min[0] < end)) {
        min[0] = end;
      }
    } else if (!min[1] || (min[1] > start)) { // upcoming or ongoing
      min[1] = start;
    }
  });

  if (min[1]) return min[1];

  if (min[0]) return min[0];

  return false;
};

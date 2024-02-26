'use strict';

module.exports = (filter, data) => {
  const minDate = new Date(filter.gte);
  const maxDate = new Date(filter.lte);

  return data.timings.some(timing => {
    const beginDate = new Date(timing.begin);
    const endDate = new Date(timing.end);
    return endDate > minDate && beginDate < maxDate;
  });
};

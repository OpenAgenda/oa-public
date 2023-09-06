import * as dateFns from 'date-fns';

export default datetime => {
  const laterDate = dateFns.addMilliseconds(datetime, 1);

  if (dateFns.isEqual(dateFns.startOfDay(datetime), datetime)) {
    return dateFns.subMilliseconds(datetime, 1);
  }

  if (
    dateFns.isSameDay(laterDate, datetime)
    && !dateFns.isSameMinute(laterDate, datetime)
  ) {
    return laterDate;
  }

  return datetime;
};

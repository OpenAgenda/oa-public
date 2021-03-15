import * as dateFns from 'date-fns';
import DST from './DST';

export default (
  { activeWeek, weekStartsOn, selectableStep },
  { begin, end }
) => {
  const startOfActiveWeek = dateFns.startOfWeek(activeWeek, { weekStartsOn });
  const startOfBeginDay = dateFns.startOfDay(begin);
  const startOfEndDay = dateFns.startOfDay(end);

  const beginStepsToTop = dateFns.differenceInMilliseconds(begin, startOfBeginDay)
      / selectableStep
      / 1000
    - (DST.dayOffset(begin) * 60 * 60) / selectableStep;

  const endStepsToTop = dateFns.differenceInMilliseconds(end, startOfEndDay)
      / selectableStep
      / 1000
    - (DST.dayOffset(end) * 60 * 60) / selectableStep;

  const beginLeft = dateFns.differenceInDays(
    startOfBeginDay,
    startOfActiveWeek
  );
  const endLeft = dateFns.differenceInDays(startOfEndDay, startOfActiveWeek);

  const steps = dateFns.differenceInMilliseconds(end, begin) / selectableStep / 1000;

  return {
    begin: {
      top: beginStepsToTop,
      left: beginLeft,
    },
    end: {
      top: endStepsToTop,
      left: endLeft,
    },
    steps,
  };
};

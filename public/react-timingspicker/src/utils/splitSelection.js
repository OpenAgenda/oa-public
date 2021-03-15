import * as dateFns from 'date-fns';
import normalizeEndOfTiming from './normalizeEndOfTiming';

/**
 * splits timing when duration exceeds permitted maximum set by timingLimit
 */
export default (
  {
    activeWeek, weekStartsOn, selectableStep, timingLimit
  },
  { begin, end }
) => {
  const startOfActiveWeek = dateFns.startOfWeek(activeWeek, { weekStartsOn });

  const timingDuration = dateFns.differenceInMilliseconds(end, begin) / 1000;
  const usedEnd = normalizeEndOfTiming(end);

  if (timingDuration <= timingLimit) {
    return [{ begin, end: usedEnd }];
  }

  const daysNumber = dateFns.differenceInDays(dateFns.endOfDay(usedEnd), begin);
  const timeOfBegin = dateFns.subDays(
    begin,
    dateFns.differenceInDays(begin, startOfActiveWeek)
  );
  const timeOfEnd = dateFns.subDays(
    usedEnd,
    dateFns.differenceInDays(usedEnd, startOfActiveWeek)
  );
  const selection = [];
  let derivedBegin;
  let derivedEnd;

  if (!dateFns.isAfter(timeOfEnd, timeOfBegin)) {
    derivedBegin = dateFns.subDays(
      dateFns.subSeconds(usedEnd, selectableStep),
      daysNumber
    );
    derivedEnd = dateFns.addDays(
      dateFns.addSeconds(begin, selectableStep),
      daysNumber
    );
  } else {
    derivedBegin = dateFns.addDays(
      timeOfBegin,
      dateFns.differenceInDays(begin, timeOfBegin)
    );
    derivedEnd = dateFns.addDays(
      timeOfEnd,
      dateFns.differenceInDays(usedEnd, timeOfEnd)
    );
  }

  for (let i = 0; i <= daysNumber; i++) {
    selection.push({
      begin: dateFns.addDays(derivedBegin, i),
      end: dateFns.subDays(derivedEnd, daysNumber - i),
    });
  }

  return selection;
};

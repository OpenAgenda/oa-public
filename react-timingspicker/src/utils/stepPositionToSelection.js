import * as dateFns from 'date-fns';
import DST from './DST';

const noop = v => v;

/**
 * provides begin and end dates corresponding to given begin ref and current position on grid.
 */
export default (
  { activeWeek, weekStartsOn, selectableStep },
  {
    top, // cursor position: count of selectable steps from start of day?
    left, // cursor position: count of steps from begin of week
  },
  selectionStart = 0,
  ignoreRound = false
) => {
  // moment the week starts
  const startOfActiveWeek = dateFns.startOfWeek(activeWeek, { weekStartsOn });

  // moment the day under the cursor begins
  const dayHover = dateFns.addDays(startOfActiveWeek, left);

  // moment under the cursor
  const timingHover = dateFns.addSeconds(dayHover, top * selectableStep);

  DST.applyOffset(dayHover, timingHover);

  const startOfBeginDay = dateFns.startOfDay(timingHover);

  let begin;
  let end;

  if (!dateFns.isBefore(selectionStart, timingHover)) {
    const diffToNext = (ignoreRound ? noop : Math.floor)(
      dateFns.differenceInMilliseconds(timingHover, startOfBeginDay)
          / selectableStep
          / 1000
    ) * selectableStep;

    begin = dateFns.addSeconds(startOfBeginDay, diffToNext);
    end = dateFns.addSeconds(selectionStart, selectableStep);
  } else {
    const diffToNext = (ignoreRound ? noop : Math.ceil)(
      dateFns.differenceInMilliseconds(timingHover, dayHover)
          / selectableStep
          / 1000
    ) * selectableStep;

    begin = selectionStart;
    end = dateFns.addSeconds(dayHover, diffToNext);
  }

  return { begin, end };
};

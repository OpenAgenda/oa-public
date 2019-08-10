import dateFns from 'date-fns';

import DST from './DST';
import secondsToHeight from './secondsToHeight';

export default {
  top
}

function top( {
  selectableStep,
  step,
  cellHeight
}, { begin, end } ) {
  const startOfDay = dateFns.startOfDay( begin );

  const firstColumnTop = dateFns.differenceInMilliseconds(
    begin,
    startOfDay
  ) / 1000;

  const top = secondsToHeight( { selectableStep, step, cellHeight }, firstColumnTop );
  const beginAsDate = new Date( begin );

  // DST switch means there is one dead cell
  // or one ghost cell in column. Top needs to be offset
  // that will mess up positionning
  if ( DST.hasSwitched(
    startOfDay,
    beginAsDate
  ) ) {
    const offset = (
      DST.dayOffset( beginAsDate ) * 60 * 60 / step // DST offset in pixels
    ) * cellHeight;
    return top - offset;
  }

  return top;
}

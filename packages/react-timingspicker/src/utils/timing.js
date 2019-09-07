import dateFns from 'date-fns';

import DST from './DST';
import secondsToHeight from './secondsToHeight';

export default {
  top
};

function top({ selectableStep, step, cellHeight }, { begin, end }) {
  const startOfDay = dateFns.startOfDay(begin);

  const firstColumnTop = dateFns.differenceInMilliseconds(begin, startOfDay) / 1000;

  const top = secondsToHeight(
    { selectableStep, step, cellHeight },
    firstColumnTop
  );

  // DST switch means there is one dead cell
  // or one ghost cell in column. Top needs to be offset
  // that will mess up positionning
  return DST.offsetTop({ step, cellHeight }, begin, top);
}

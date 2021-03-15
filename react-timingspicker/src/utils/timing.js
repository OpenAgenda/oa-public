import * as dateFns from 'date-fns';

import DST from './DST';
import secondsToHeight from './secondsToHeight';

function top({ selectableStep, step, cellHeight }, { begin }) {
  const startOfDay = dateFns.startOfDay(begin);

  const firstColumnTop = dateFns.differenceInMilliseconds(begin, startOfDay) / 1000;

  const offsetTop = secondsToHeight(
    { selectableStep, step, cellHeight },
    firstColumnTop
  );

  // DST switch means there is one dead cell
  // or one ghost cell in column. Top needs to be offset
  // that will mess up positionning
  return DST.offsetTop({ step, cellHeight }, begin, offsetTop);
}

export default {
  top,
};

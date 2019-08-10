import dateFns from 'date-fns';
import DST from './DST';

const noop = v => v;

/**
 * provides begin and end dates corresponding to given begin ref and current position on grid.
 */
export default ( {
  activeWeek,
  weekStartsOn,
  selectableStep
}, { top, left }, selectionStart = null, ignoreRound = false ) => {
  const startOfActiveWeek = dateFns.startOfWeek( activeWeek, { weekStartsOn } );
  const dayHover = dateFns.addDays( startOfActiveWeek, left );
  const timingHover = dateFns.addSeconds( dayHover, top * selectableStep );
  const startOfBeginDay = dateFns.startOfDay( timingHover );

  _applyDSTOffset( startOfBeginDay, timingHover );

  let begin;
  let end;

  if ( !dateFns.isBefore( selectionStart, timingHover ) ) {
    const diffToNext =
      (ignoreRound ? noop : Math.floor)(
        dateFns.differenceInMilliseconds( timingHover, startOfBeginDay ) / selectableStep / 1000
      ) * selectableStep;

    begin = dateFns.addSeconds( startOfBeginDay, diffToNext );
    end = dateFns.addSeconds( selectionStart, selectableStep );
  } else {
    const diffToNext =
      (ignoreRound ? noop : Math.ceil)(
        dateFns.differenceInMilliseconds( timingHover, dayHover ) / selectableStep / 1000
      ) * selectableStep;

    begin = selectionStart;
    end = dateFns.addSeconds( dayHover, diffToNext );
  }

  return { begin, end };
};

function _applyDSTOffset( ref, d ) {
  if ( !d || !DST.hasSwitched( ref, d ) ) return;

  d.setHours( d.getHours() + DST.dayOffset( d ) );
}


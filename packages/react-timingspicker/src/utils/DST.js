import dateFns from 'date-fns';

export default {
  dayOffset,
  hasSwitched,
  isObserved,
  isSwitchObserved,
  offsetTop,
  applyOffset
}

function applyOffset( ref, d ) {
  if ( !d ) return;

  if ( !hasSwitched( ref, d ) ) return;

  d.setHours( d.getHours() + dayOffset( d ) );
}

function offsetTop( { step, cellHeight }, d, top ) {
  if ( !d ) return top;

  const date = typeof d === 'string' ? new Date( d ) : d;

  if ( !hasSwitched( dateFns.startOfDay( date ), date ) ) return top;

  const offset = (
    dayOffset( date ) * 60 * 60 / step // DST offset in pixels
  ) * cellHeight;

  return top - offset;
}

function dayOffset( d ) {
  const dayBefore = new Date( d );
  dayBefore.setDate( dayBefore.getDate() - 1 );
  const dayAfter = new Date( d );
  dayAfter.setDate( dayAfter.getDate() + 1 );

  return ( dayAfter.getTime() - dayBefore.getTime() ) / 60 / 60 / 1000 - ( 24 * 2 );
}

function hasSwitched( d1, d2 ) {
  return isObserved( d1 ) !== isObserved( d2 );
}

function isSwitchObserved( d ) {
  const dayStart = new Date( d );
  const dayFinish = new Date( d );

  dayStart.setHours( 0 );
  dayFinish.setHours( 24 );

  return isObserved( dayStart ) !== isObserved( dayFinish );
}


function isObserved( d ) {
  const jan = new Date(d.getFullYear(), 0, 1);
  const jul = new Date(d.getFullYear(), 6, 1);

  return d.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

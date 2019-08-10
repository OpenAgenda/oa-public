export default {
  dayOffset,
  hasSwitched,
  isObserved,
  isSwitchObserved
}

function dayOffset( d ) {
  const dayStart = new Date( d );
  const dayFinish = new Date( d );

  dayStart.setHours( 0 );
  dayFinish.setHours( 24 );

  return ( dayFinish.getTime() - dayStart.getTime() ) / 60 / 60 / 1000 - 24;
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

"use strict";

const tfy = require( './lib/taskify' );


module.exports = () => {

  tfy( require( './search/task' ), { bootOffset: 1000 } );

  tfy( require( './general/jobs.task' ), { bootOffset: 1000 } );

  tfy( require( './general/resetApiCounters.task' ), { period: 'daily', time: '00:00' } );

  tfy( require( './services/elasticsearch' ).refresh, { period: 'daily', time: '00:00' } );

  tfy( require( './services/notification/remove.task' ), { period: 'daily', time: '03:00' } );

  tfy( require( '@openagenda/agenda-search' ).rebuild, { period: 'daily', time: '01:00' } );

  //tfy( require( '@openagenda/agenda-monitor' ).tasks.evaluate, { bootOffset: 5000 } );
  tfy( require( '@openagenda/agenda-monitor' ).tasks.evaluate, {
    period: 'daily',
    time: '19:00'
  } );

  tfy( require( '@openagenda/activities' ).tasks.notifications.prepareSummary, {
    // bootOffset: 1000
    period: 'daily',
    time: '05:00'
  } );

  tfy( require( '@openagenda/activities' ).tasks.notifications.sendSummary, {
    // bootOffset: 5000
    period: 'daily',
    time: '08:00'
  } );

  tfy( require( '@openagenda/inboxes' ).tasks.sync, {
    period: 'weekly',
    day: 'sunday',
    time: '11:00'
  } );

  tfy( require( './services/activities/tasks/rebuild' ), {
    period: 'weekly',
    day: 'monday',
    time: '03:00'
  } );

  tfy( require( './services/mails/unsubscription' ).task, {
    period: 'weekly',
    day: 'saturday',
    time: '03:00'
  } );

  require( '@openagenda/agenda-docx' ).task();

  require( './general/mainLogger.task' )();

  require( './services/agenda/task' )();

  require( './services/aggregator' ).task();

  require( '@openagenda/email-strategie' ).task();

  require( './services/agenda/controlData' ).task();

  require( '@openagenda/agenda-stakeholders' ).tasks.bulk();

  require( '@openagenda/agenda-stakeholders' ).tasks.message();

  require( './services/event/oembed' ).task();

  require( './services/agendaStatistics' ).task();

  require( '@openagenda/custom' ).task();

  require( '@openagenda/activities' ).tasks.notifications.addActivity();

  require( '@openagenda/mails' ).task();


  if ( process.env.NODE_ENV !== 'production' ) { // COMMENT THIS WITH PRECAUTIOIN

    // require( './services/elasticsearch' ).resync( { reset: false }, ( err, res ) => console.log( 'FINI', err, res ) );

  }

  // require( './services/agendaStatistics' ).task.resyncLegacySearch();

  // require( '@openagenda/inboxes' ).tasks.sync();

  //require( '@openagenda/events' ).tasks.slowTransfer( { force: true, interval: 500 } );

  /*require( 'agenda-events').tasks.transferUserUids().then( report => {

    console.log( 'done!' );
    console.log( report );

  } ); */

  /*require( 'async' ).eachSeries( [ 55750, 3204291, 9761904, 9788289,13315500,15029117,15518291,16482835,17540015,19378824,25565771,27373160,29187378,30013147,33431413,35706423,36293687,36938083,40682349,43429663,43734901,44641740,45654961,47747797,47753493,48223923,49523420,49759107,51842062,60511877,60839018,61198287,61769221,62067159,64727419,65197251,66376417,67699870,69863067,70615195,70873206,71616772,72056182,75356940,76268329,78197229,79414561,79642759,79956696,79989652,80522802,81532949,81850636,83103616,83945917,84529570,84691336,86489159,87180696,89095402,89742210,90716457,94265385,95507509,97878981,98082620 ], ( uid, ecb ) => {

    require( './services/events' ).legacy.onUpdate( { uid }, ecb );

  }, err => {

    console.log( err );

  } );*/


  // plug legacy plateform lifecycle event to agenda event service
  require( './services/agendaEvents/legacy' ).task();

  // handle interfaces for grouped operations ( a remove of a 100 refs queues 100 onRemoves executions )
  require( '@openagenda/agenda-events' ).tasks.interfaces( { interval: 10 } );

  //require( '@openagenda/agenda-events' ).tasks.transferLegacyData( { interval: 500 } );

  require( './services/eventSearch' ).task();

};

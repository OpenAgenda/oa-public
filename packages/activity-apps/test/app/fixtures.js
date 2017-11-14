"use strict";

const wn = require( 'when/node' );
const fixtures = require( '@openagenda/fixtures' );
const activitiesSvc = require( '@openagenda/activities/test/service' );
const config = require( '../../testconfig.js' );

fix().catch( console.error );

async function fix() {

  try {

    fixtures.init( config );

    await activitiesSvc.initAndLoad( config, [] );

    await wn.call( fixtures, [ {
      table: config.schemas.activity,
      src: __dirname + '/../fixtures/activity.data.sql'
    }, {
      table: config.schemas.feed,
      src: __dirname + '/../fixtures/feed.data.sql'
    }, {
      table: config.schemas.feed_activity,
      src: __dirname + '/../fixtures/feed_activity.data.sql'
    }, {
      table: config.schemas.feed_follow,
      src: __dirname + '/../fixtures/feed_follow.data.sql'
    }, {
      table: config.schemas.feed_notification,
      src: __dirname + '/../fixtures/feed_notification.data.sql'
    } ], { reset: false } );

  } catch ( e ) {

    console.error( e );
    process.exit( 1 );

  }

}

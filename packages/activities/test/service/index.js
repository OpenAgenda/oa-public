"use strict";

// proxy function for service in a test env. Init does service init as well as fixture loading.

const wn = require( 'when/node' );
const fixtures = require( '@openagenda/fixtures' );
const Service = require( '../../src/service' );

module.exports = Service;

module.exports.initAndLoad = async function ( config, files, options ) {

  const defautFiles = [
    'activity',
    'feed',
    'feed_activity',
    'feed_follow',
    'feed_notification'
  ];

  if ( arguments.length === 2 && Array.isArray( arguments[ 1 ] ) ) {

    options = { reset: true };

  } else if ( arguments.length === 2 ) {

    options = files;

    files = defautFiles;

  } else if ( arguments.length === 1 ) {

    options = { reset: true };

    files = defautFiles;

  }

  const params = Object.assign( {
    reset: true
  }, options );

  fixtures.init( { mysql: config.mysql } );

  await wn.call( fixtures, [], { reset: params.reset } );

  const service = await Service( config );

  await wn.call( fixtures, [ {
    table: config.schemas.activity,
    src: __dirname + '/activity.data.sql'
  }, {
    table: config.schemas.feed,
    src: __dirname + '/feed.data.sql'
  }, {
    table: config.schemas.feed_activity,
    src: __dirname + '/feed_activity.data.sql'
  }, {
    table: config.schemas.feed_follow,
    src: __dirname + '/feed_follow.data.sql'
  }, {
    table: config.schemas.feed_notification,
    src: __dirname + '/feed_notification.data.sql'
  }, {
    table: config.schemas.rebuild_agenda,
    src: __dirname + '/rebuild_agenda.data.sql'
  }, {
    table: config.schemas.rebuild_event,
    src: __dirname + '/rebuild_event.data.sql'
  }, {
    table: config.schemas.rebuild_review_article,
    src: __dirname + '/rebuild_review_article.data.sql'
  }, {
    table: config.schemas.rebuild_reviewer,
    src: __dirname + '/rebuild_reviewer.data.sql'
  }, {
    table: config.schemas.rebuild_user,
    src: __dirname + '/rebuild_user.data.sql'
  }, {
    table: config.schemas.rebuild_aggregator,
    src: __dirname + '/rebuild_aggregator.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), { reset: false } );

  return service;

};

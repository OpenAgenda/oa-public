"use strict";

const get = require( '@openagenda/utils/get' );
const session = require( '@openagenda/sessions/client' );
const debug = require( 'debug' );

const _ = {
  get: require( 'lodash/get' )
};

let log = () => {};

const checkInterval = 1000*60*5;

module.exports = async () => {

  log = debug( 'envelope' );

  log( 'running envelope' );

  if ( window && window.location.href.indexOf( '/home/inbox' ) !== -1 ) {

    return _clearHasNew();

  }

  if ( await _hasNew() ) {

    log( 'displaying has new message' );

    _displayHasNew();

  }

}

async function _clearHasNew() {

  log( 'clearing has new' );

  const inboxSummary = await session.inbox.getSummary();

  inboxSummary.lastKnownState = false;
  inboxSummary.lastRequestTime = ( new Date ).getTime();

  session.inbox.setSummary( inboxSummary );

}

async function _hasNew() {

  const inboxSummary = await session.inbox.getSummary();

  const { lastRequestTime, lastKnownState } = inboxSummary;

  const nowTime = ( new Date ).getTime();

  log( 'inboxSummary', inboxSummary );

  if ( nowTime - lastRequestTime  < checkInterval ) {

    log( 'next check in %s', checkInterval - nowTime + lastRequestTime );

    return !!lastKnownState;

  }

  log( 'fetching has new message' );

  const { hasNew } = await _get();

  log( 'fetched has new message', hasNew );

  inboxSummary.lastRequestTime = nowTime;

  inboxSummary.lastKnownState = hasNew;

  session.inbox.setSummary( inboxSummary );

  return hasNew;

}

function _displayHasNew() {

  const parent = document.querySelector('.js_inbox_header a');

  parent.insertAdjacentHTML( 'beforeEnd', '<span class="label label-danger "><i class="fa fa-exclamation"></i></span>' );

}

function _get() {

  return new Promise( ( rs, rj ) => {

    get( window.env === 'tpl' ? '/server/latest-inbox-timestamp.json' : '/latest-inbox-timestamp', ( err, res ) => {

      if ( err ) return rj( err );

      rs( res );

    } );

  } );

}

"use strict";

const du = require( '@openagenda/dom-utils' );
const dl = require( '@openagenda/dom-utils/documentLocation' );
const sessions = require( '@openagenda/sessions/client' );
const get = require( '@openagenda/utils/get' );
const merge = require( 'lodash/merge' );
const Spinner = require( 'spin.js' );

let anchorElem;
let labelElem;
let openerElem;
let panelElem;
let params;
let myScroll;

let notifsCount = null;
let panelClicked = false;
let panelOpened = false;

let notifications;
let lastPage = false;

module.exports = options => {

  params = merge( {
    selectors: {
      notifications: '.js_notifications',
      notificationsLabel: '.js_notifications .label',
      notificationsOpener: '.js_notifications_opener',
      notificationsPanel: '.js_notifications_panel',
      notificationsBody: '.notifications-body',
      next: '.js_notifications .next',
      readAll: '.js_notifications .read-all',
      seeActivities: '.js_notifications .see-activities',
    },
    classes: {
      hide: 'hide'
    },
    res: {
      getCounter: '/notifications/count',
      list: '/notifications/list',
      remove: '/notifications/remove/:notifId',
      markRead: '/notifications/mark-read/:notifId',
      markAllRead: '/notifications/mark-all-read',
      seeActivities: '/home/activities',
    }
  }, options );

  const lang = dl.getQueryPart( 'lang', 'fr' );
  const user = sessions.getUser();

  if ( !user ) return;

  params.res = Object.keys( params.res ).reduce( ( prev, next ) => {
    const actualUrl = params.res[ next ];
    return Object.assign( {}, prev, {
      [ next ]: actualUrl.indexOf( '?' ) !== -1 ? `${actualUrl}&lang=${lang}` : `${actualUrl}?lang=${lang}`
    } );
  }, {} );

  anchorElem = document.querySelector( params.selectors.notifications );
  labelElem = document.querySelector( params.selectors.notificationsLabel );
  openerElem = document.querySelector( params.selectors.notificationsOpener );
  panelElem = document.querySelector( params.selectors.notificationsPanel );

  if ( !anchorElem ) return;

  getCounter( ( err, nbr ) => {

    if ( err ) return;

    if ( du.hasClass( anchorElem, params.classes.hide ) ) {
      du.removeClass( anchorElem, params.classes.hide );
    }

    setCounter( nbr );

  } );

  // On panel opener
  du.addEvent( openerElem, 'click', e => {

    du.preventDefault( e );

    if ( panelOpened ) {
      panelOpened = false;
      return du.addClass( panelElem, params.classes.hide );
    }

    if ( notifsCount === null ) return;

    setLoading( true );

    get( params.res.list, ( err, result ) => {

      setLoading( false );

      if ( err || !result ) return;

      notifications = result.notifications;
      lastPage = result.lastPage;

      setCounter( result.counter );

      panelElem.innerHTML = result.html;
      du.removeClass( panelElem, params.classes.hide );

      panelOpened = true;

      if ( lastPage ) {
        const nextElem = document.querySelector( params.selectors.next );
        if ( nextElem ) {
          nextElem.parentNode.parentNode.remove();
        }
      }

      refreshScroll();

      setListeners( { onSeeActivitiesClick: params.onSeeActivitiesClick } );

    } );

  } );

  du.addEvent( panelElem, 'click', () => {
    panelClicked = true;
  } );

  du.addEvent( panelElem, 'mousedown', () => {
    panelClicked = true;
  } );

  du.addEvent( document.documentElement, 'click', () => {

    if ( panelOpened && !panelClicked ) {
      panelOpened = false;
      du.addClass( panelElem, params.classes.hide );
      myScroll = null;
    }

    panelClicked = false;

  } );

};

function onRemoveClick( elem ) {

  return e => {

    du.preventDefault( e );
    e.stopPropagation();

    const notifElem = elem.parentNode.parentNode;
    const id = notifElem.getAttribute( 'data-id' );

    get( params.res.remove.replace( ':notifId', id ), ( err, data ) => {

      if ( err || !data ) return;

      get( `${params.res.list}&fromId=${notifications[ notifications.length - 1 ].id}&justOne=1`, ( err, result ) => {

        if ( err || !result ) return;

        notifications = notifications.filter( v => v.id !== parseInt( id ) );
        notifElem.remove();

        appendNotifications( result );

      } );

    } );

    return false;

  };

}

function onMarkReadClick( elem ) {

  return e => {

    du.preventDefault( e );
    e.stopPropagation();

    const notifElem = elem.parentNode.parentNode;
    const id = notifElem.getAttribute( 'data-id' );

    get( params.res.markRead.replace( ':notifId', id ), err => {

      if ( err ) return;

      if ( !du.hasClass( notifElem, 'read' ) ) du.addClass( notifElem, 'read' );

    } );

    return false;

  };

}

function onNextClick() {

  return e => {

    du.preventDefault( e );

    get( `${params.res.list}&fromId=${notifications[ notifications.length - 1 ].id}`, ( err, result ) => {

      if ( err || !result ) return;

      appendNotifications( result );

    } );

  }

}

function onReadAllClick() {

  return e => {

    du.preventDefault( e );

    get( params.res.markAllRead, ( err, result ) => {

      if ( err || !result ) return;

      Array.from( panelElem.querySelectorAll( 'a.list-group-item' ) ).map( el => {

        if ( !du.hasClass( el, 'read' ) ) du.addClass( el, 'read' );

      } );

      setCounter( 0 );

    } );

  };

}

function _onSeeActivitiesClick( { onSeeActivitiesClick } = {} ) {

  return e => {

    if ( typeof onSeeActivitiesClick === 'function' ) {
      onSeeActivitiesClick( e );
    } else {
      du.preventDefault( e );
      window.location.href = params.res.seeActivities;
    }

  };

}

function appendNotifications( result ) {

  notifications = notifications.concat( result.notifications );
  lastPage = result.lastPage;

  const nextElem = document.querySelector( params.selectors.next );

  if ( lastPage && nextElem ) {
    nextElem.parentNode.parentNode.remove();
  }

  const div = document.createElement( 'div' );
  div.innerHTML = result.html;
  const receivedList = div.querySelectorAll( 'a.list-group-item' );

  if ( result.notifications.length && receivedList && receivedList.length ) {

    Array.from( receivedList ).forEach( el => {
      const removeElem = el.querySelector( '.remove' );
      const markReadElem = el.querySelector( '.mark-read' );
      du.addEvent( removeElem, 'click', onRemoveClick( removeElem ) );
      du.addEvent( markReadElem, 'click', onMarkReadClick( markReadElem ) );
      if ( nextElem ) {
        nextElem.parentNode.parentNode.insertAdjacentElement( 'beforebegin', el );
      } else {
        const listElems = panelElem.querySelectorAll( 'a.list-group-item' );
        listElems[ listElems.length - 1 ].insertAdjacentElement( 'afterend', el );
      }
    } );

  } else if ( !notifications.length ) {

    panelElem.innerHTML = result.html;

  }

  setCounter( result.counter );
  refreshScroll();

}

function onNotifClick( elem ) {

  return e => {

    du.preventDefault( e );

    const id = elem.getAttribute( 'data-id' );
    const href = elem.getAttribute( 'href' );

    if ( !href ) return;

    get( params.res.markRead.replace( ':notifId', id ), () => {

      window.location.href = href;

    } );

  };

}

function getCounter( cb ) {

  const counter = sessions.notifications.getCount();

  if ( counter ) {

    return cb( null, counter );

  }

  get( params.res.getCounter, ( err, data ) => {

    cb( err, data && data.counter );

  } );

}

function setCounter( nbr ) {

  sessions.notifications.setCount( nbr );

  notifsCount = nbr;
  labelElem.innerHTML = nbr;

  ( !nbr ? du.addClass : du.removeClass )( labelElem, params.classes.hide );

}

function refreshScroll() {

  if ( myScroll ) return myScroll.refresh();

  const elem = document.querySelector( params.selectors.notificationsBody );

  if ( !elem.children.length ) return;

  myScroll = new IScroll( elem, {
    scrollbars: true,
    mouseWheel: true,
    interactiveScrollbars: true,
    shrinkScrollbars: 'scale',
    // fadeScrollbars: true
  } );

}

function setLoading( loading = true ) {

  if ( loading ) {

    panelElem.innerHTML = '<div class="notifications-body loading"></div>';

    new Spinner( {
      width: 1,
      length: 6,
      radius: 10,
      color: '#666'
    } ).spin( panelElem.querySelector( '.notifications-body' ) );

    du.removeClass( panelElem, params.classes.hide );

  } else {

    panelElem.innerHTML = '';
    du.addClass( panelElem, params.classes.hide );

  }

}

function setListeners( options ) {

  du.addEvent( document.querySelector( params.selectors.next ), 'click', onNextClick() );

  du.addEvent( document.querySelector( params.selectors.readAll ), 'click', onReadAllClick() );

  du.addEvent( document.querySelector( params.selectors.seeActivities ), 'click', _onSeeActivitiesClick( options ) );

  Array.from( panelElem.querySelectorAll( '.list-group-item' ) )
    .map( el => {
      du.addEvent( el, 'click', onNotifClick( el ) );
    } );

  Array.from( panelElem.querySelectorAll( 'a.list-group-item .remove' ) )
    .map( el => {
      du.addEvent( el, 'click', onRemoveClick( el ) );
    } );

  Array.from( panelElem.querySelectorAll( 'a.list-group-item .mark-read' ) )
    .map( el => {
      du.addEvent( el, 'click', onMarkReadClick( el ) );
    } );

}

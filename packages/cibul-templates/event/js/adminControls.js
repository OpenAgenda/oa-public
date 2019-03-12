import ReactDOM from 'react-dom';
import debug from 'debug';
import u from '@openagenda/utils';
import du from '../../js/lib/domUtils';
import duplicateApp from './duplicate/app';
import * as agendasActions from './duplicate/redux/modules/agendas';
import * as modalsActions from './duplicate/redux/modules/modals';


module.exports = process;
module.exports.init = init;
module.exports.ifAdmin = ifAdmin;


let log;
let shouldDisplay = false;
const ifAdminCallbacks = [];

const params = {
  ownerUid: false,
  adminAgendaUids: [],
  selectors: {
    controls: '.js_admin_controls',
    item: '.js_admin_item'
  },
  displaySelectors: false,
  classes: {
    displayNone: 'display-none'
  },
  testFunc: _test // optional function for substituting to test
};



function init() {

  hide( !shouldDisplay );

  // _move();

  _displayItems();

}

function ifAdmin( cb ) {

  ifAdminCallbacks.push( cb );

}

function process( session, options ) {

  u.extend( params, options );

  log = debug( 'adminControls' );

  if ( params.testFunc( session ) ) {

    _display();

    u.forEach( ifAdminCallbacks, function ( cb ) {

      cb();

    } );

    return true;

  }

  return false;

}


function hide( hideMenu ) {

  if ( typeof log !== 'undefined' ) log( hideMenu ? 'hiding' : 'diplaying' );

  if ( hideMenu ) {

    du.addClass( du.el( params.selectors.controls ), params.classes.displayNone );

  } else {

    du.removeClass( du.el( params.selectors.controls ), params.classes.displayNone );

  }

  u.forEach( du.els( params.selectors.item ), function ( item ) {

    du.addClass( item, params.classes.displayNone );

  } );

}

function _test( session ) {

  if ( !session.logged ) {

    log( 'user is not logged' );

    return false;

  }

  if ( session.uid === params.ownerUid ) {

    log( 'user is owner' );

    _display();

    return true;

  }

  for ( let i = 0; i < params.adminAgendaUids.length; i++ ) {

    if ( session.reviews.admUids.indexOf( params.adminAgendaUids[ i ] + '' ) !== -1 ) {

      log( 'user is admin' );

      return true;

    }

  }

  return false;

}

function _displayItems() {

  if ( !params.displaySelectors ) {

    params.displaySelectors = [ params.selectors.item ];

  }

  u.forEach( params.displaySelectors ? params.displaySelectors : [ params.selectors.item ], function ( selector ) {

    u.forEach( du.els( selector ), function ( item ) {

      du.removeClass( item, params.classes.displayNone );

    } );

  } );

}

function _display() {

  shouldDisplay = true;

  var controlsElem = du.el( params.selectors.controls );

  du.removeClass( controlsElem, params.classes.displayNone );

  u.forEach( du.els( 'a', controlsElem ), function ( a ) {

    if ( a.hasAttribute( 'data-href' ) ) {

      a.setAttribute( 'href', a.getAttribute( 'data-href' ) );

      a.removeAttribute( 'data-href' );

    }

  } );

  const { element, store } = duplicateApp( {
    lang: params.lang,
    eventUid: params.eventUid,
    agendaUid: params.agendaUid,
    agendaSlug: params.agendaSlug,
    agendaTitle: params.agendaTitle,
    agendaImage: params.agendaImage
  } );

  const linkElem = du.el( '.js_duplicate_event_link' );

  if ( linkElem ) {
    du.addEvent( linkElem, 'click', e => {
      e.preventDefault();

      store.dispatch( agendasActions.load( 'selectAgendasForDuplicate' ) );
      store.dispatch( modalsActions.showModal( 'selectAgendasForDuplicate' ) );
    } );
  }

  ReactDOM.render(
    element,
    document.body.insertBefore(
      document.createElement( 'div' ),
      document.body.lastChild
    )
  );
}

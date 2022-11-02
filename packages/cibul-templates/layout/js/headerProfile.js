"use strict";

const extend = require( 'lodash/extend' );

const getLabelFactory = require( '@openagenda/labels' );
const labels = require( '@openagenda/labels/users/profile' );
const session = require( '@openagenda/sessions/client' );

const bsTemplate = require( '../../user/bsMenu.ejs' );
const template = require( '../../user/menu.ejs' );
const b64 = require( '../../js/lib/Base64' );
const du = require( '../../js/lib/domUtils' );
const envelope = require( './envelope' );
const toggle = require( './toggle' );

const params = {
  selectors: {
    languageMenu: '.js_language_menu',
    headerLinks: '.js_header_links',
    signinLink: '.js_signin_link',
    profile: '.js_profile',
    dropdown: '.js_profile_dropdown',
    notifications: '.js_notifications',
    inbox: '.js_inbox_header',
  },
  classes: {
    displayNone: 'display-none'
  },
  template: 'user/menu'
};

let pClicked = false;

module.exports = options => {

  extend( params, options );

  let languageMenu = du.el( params.selectors.languageMenu ),

    signinLink = du.el( params.selectors.signinLink ),

    ul = document.createElement( 'ul' ),

    li;

  if ( !session.isLogged() ) {

    return;

  }

  let user = session.getUser();

  if ( languageMenu ) languageMenu.remove();

  signinLink.remove();

  ul.innerHTML = ( window.templates === 'bs' ? bsTemplate : template )( {
    __ : getLabelFactory( labels, user.culture ),
    fullName: user.name,
    thumbnail: user.thumbnail ? user.thumbnail.replace( 'cibuldev', 'cibul' ) : null
  } );

  li = du.el( ul, 'li' );

  du.el(params.selectors.headerLinks).insertAdjacentElement( 'beforeend', li );

  toggle( li );

  envelope();

};

function _addSigninLinkRedirect( elem ) {

  elem.setAttribute( 'href', elem.getAttribute( 'href' ) + '?redirect=' + b64.encode( window.location.href ) );

}

function _behave( li ) {

  du.addEvent( du.el( li, params.selectors.profile ), 'click', function( e ) {

    pClicked = true;

    setTimeout(function() {

      pClicked = false;

    }, false);

  });

  du.addEvent( du.el( 'body' ), 'click', function( e ) {

    if ( pClicked ) {

      _show( li );

    } else {

      _hide( li );

    }

  });

}

function _show( li ) {

  du.removeClass( du.el( li, params.selectors.dropdown ), params.classes.displayNone );

}

function _hide( li ) {

  du.addClass( du.el( li, params.selectors.dropdown ), params.classes.displayNone );

}

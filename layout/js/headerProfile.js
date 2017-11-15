"use strict";

const session = require( '@openagenda/sessions/client' ),

  b64 = require( '../../js/lib/Base64/Base64.mod.js' ),

  toggle = require( './toggle' ),

  template = require( '../../user/menu.ejs' ),

  getLabelFactory = require( '@openagenda/labels' ),

  labels = require( '@openagenda/labels/users/profile' ),

  bsTemplate = require( '../../user/bsMenu.ejs' ),

  extend = require( 'lodash/extend' ),

  du = require( '../../js/lib/domUtils' ),

  params = {
    selectors: {
      languageMenu: '.js_language_menu',
      headerLinks: '.js_header_links',
      signinLink: '.js_signin_link',
      profile: '.js_profile',
      dropdown: '.js_profile_dropdown',
      notifications: '.js_notifications',
      inbox: '.js_inbox',
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

  du.el( params.selectors.notifications ).insertAdjacentElement( 'beforebegin', li );

  toggle( li );

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
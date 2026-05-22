"use strict";

import { authClient } from '@openagenda/auth/client';

const extend = require( 'lodash/extend' );

const getLabelFactory = require( '@openagenda/labels' );
const labels = require( '@openagenda/labels/users/profile' );

const image = require( '../../helpers/image' )();

const bsTemplate = require( '../../user/bsMenu.ejs' );
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
  template: 'user/bsMenu'
};

let pClicked = false;

module.exports = async options => {

  extend( params, options );

  let languageMenu = du.el( params.selectors.languageMenu ),

    signinLink = du.el( params.selectors.signinLink ),

    ul = document.createElement( 'ul' ),

    li;

  let user = ( await authClient.getSession() ).data?.user ?? null;

  if ( !user ) {

    return;

  }

  if ( languageMenu ) languageMenu.remove();

  signinLink.remove();

  ul.innerHTML = bsTemplate( {
    __ : getLabelFactory( labels, user.culture ),
    fullName: user.name,
    thumbnail: user.image ? image( user.image ) : null
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

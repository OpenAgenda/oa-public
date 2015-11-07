"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

cTemplater = require( './clientTemplater' ),

b64 = require( '../../js/lib/Base64/Base64.mod.js' ),

toggle = require( './toggle' ),

utils = require( 'utils' ),

du = require( '../../js/lib/domUtils' ),

params = {
  selectors: {
    languageMenu: '.js_language_menu',
    headerLinks: '.js_header_links',
    signinLink: '.js_signin_link',
    profile: '.js_profile',
    dropdown: '.js_profile_dropdown'
  },
  classes: {
    displayNone: 'display-none'
  },
  template: 'user/menu'
},

pClicked = false;

module.exports = function( options ) {

  params = utils.extend( params, options );

  var languageMenu = du.el( params.selectors.languageMenu ),

  signinLink = du.el( params.selectors.signinLink );

  // tmp hack to avoid execution on legacy project
  if ( !languageMenu ) return;

  // tmp hack to know which user template to load
  if ( window.templates == 'bs' ) params.template = 'user/bsMenu';

  window.getSession( function( session ) {

    if ( !session.logged ) {

      _addSigninLinkRedirect( du.el( params.selectors.signinLink ) );

      return;

    }

    languageMenu.parentNode.removeChild( languageMenu );

    signinLink.parentNode.removeChild( signinLink );

    cTemplater( params.template, {
      urls: {
        settingsIndex: '/settings',
        homeEvents: '/home/events',
        homeAgendas: '/home',
        signout: '/signout',
        agendaNew: '/new',
        searchAgendas: '/agendas/search'
      },
      fullName: session.fullName,
      thumbnail: session.thumbnail,
      lang: session.culture,
      lastUpdate: window.env=='dev' ? new Date() : session.lastTemplateUpdate
    }, function( err, template ) {

      if ( err ) {
        
        return;
        
      }

      var rendered = template.render( session ),

      ul = document.createElement( 'ul' ),

      li;

      ul.innerHTML = rendered;

      li = du.el( ul, 'li' );

      du.el( params.selectors.headerLinks ).insertAdjacentElement( 'beforeend', li );

      toggle( li );

    });


  });

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
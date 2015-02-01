var cn = require( '../../js/lib/common/common.mod.js' ),

cTemplater = require( './clientTemplater' ),

b64 = require( '../../js/lib/Base64/Base64.mod.js' ),

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

  params = cn.extend( params, options );

  var languageMenu = cn.el( params.selectors.languageMenu ),

  signinLink = cn.el( params.selectors.signinLink );

  // tmp hack to avoid execution on legacy project
  if ( !languageMenu ) return;

  window.getSession( function( session ) {

    if ( !session.logged ) {

      _addSigninLinkRedirect( cn.el( params.selectors.signinLink ) );

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
        agendaNew: '/agendas/new',
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

      li = document.createElement( 'li' );

      li.innerHTML = rendered;

      _hide( li );

      _behave( li );

      cn.el( params.selectors.headerLinks ).insertAdjacentElement( 'beforeend', li );

    });


  });

};

function _addSigninLinkRedirect( elem ) {

  elem.setAttribute( 'href', elem.getAttribute( 'href' ) + '?redirect=' + b64.encode( window.location.href ) );

}

var _behave = function( li ) {

  cn.addEvent( cn.el( li, params.selectors.profile ), 'click', function( e ) {

    pClicked = true;

    setTimeout(function() {

      pClicked = false;

    }, false);

  });

  cn.addEvent( cn.el( 'body' ), 'click', function( e ) {

    if ( pClicked ) {

      _show( li );

    } else {

      _hide( li );

    }

  });

},

_show = function( li ) {

  cn.removeClass( cn.el( li, params.selectors.dropdown ), params.classes.displayNone );

},

_hide = function( li ) {

  cn.addClass( cn.el( li, params.selectors.dropdown ), params.classes.displayNone );

};
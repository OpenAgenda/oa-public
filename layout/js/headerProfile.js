var cn = require('../../js/lib/common/common.mod.js'),

cTemplater = require( './clientTemplater' ),

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

  window.getSession( function( session ) {

    if ( !session.logged ) return;

    cn.el( params.selectors.languageMenu ).parentNode.removeChild( cn.el( params.selectors.languageMenu ) );

    cn.el( params.selectors.signinLink ).parentNode.removeChild( cn.el( params.selectors.signinLink ) );

    cTemplater( params.template, {
      urls: {
        settingsIndex: '/settings',
        homeEvents: '/home/events',
        homeAgendas: '/home',
        signout: '/signout',
        agendaNew: '/agendas/new',
        searchAgendas: '/agendas/search'
      },
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
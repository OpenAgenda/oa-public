var cn = require('../../js/lib/common/common.mod.js'),

cTemplater = require('./clientTemplater'),

params = {
  selectors: {
    languageMenu: '.js_language_menu',
    headerLinks: '.js_header_links',
    profile: '.js_profile',
    dropdown: '.js_profile_dropdown'
  },
  classes: {
    displayNone: 'display-none'
  },
  template: 'user/menu'
},

pClicked = false;

module.exports = function( eh, options ) {

  params = cn.extend( params, options );

  eh.trigger('getsessiondata', function( session ) {

    if ( !session.logged ) return;

    cn.el( params.selectors.languageMenu ).parentNode.removeChild(cn.el( params.selectors.languageMenu ));

    cTemplater( params.template, {
      urls: {
        eventNew: '/events/new',
        settingsIndex: '/settings',
        homeEvents: '/home/events',
        homeAgendas: '/home',
        signout: '/signout',
        agendaNew: '/agendas/new',
        searchAgendas: '/agendas/search'
      },
      lang: session.culture,
      lastUpdate: window.env=='dev' ? new Date() : session.lastTemplateUpdate
    }, session, function( err, rendered ) {

      if ( err ) {

        console.log( err );
        return;
        
      }

      var li = document.createElement('li');

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
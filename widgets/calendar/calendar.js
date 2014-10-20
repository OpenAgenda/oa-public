var UID = 0, LANG = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

cLib = require( '../../js/vendors/CibulCalendar/src/CibulCalendar' ),

debug = require( 'debug' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

config = {
  langAttribute : 'data-lang'
},

templates = {
  main : require( './main.ejs' )
},

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' );


if ( window.env == 'tpl' ) {

  debug.enable( '*' );

}


var widget = function( elem, options ) {

  var log,

  controller,

  enabled = false,

  lang = 'en',

  calendar,

  existingDates = [],

  selection = false,

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'calendar widget ' + uid );

    if ( options.anchorConfig.length > 1 ) {

      lang = options.anchorConfig[ LANG ];

      log( 'setting widget lang to %s', lang );

    }

    if ( elem.hasAttribute( config.langAttribute )) {

      lang = elem.getAttribute( config.langAttribute );

      log( 'overwriting lang to %s', lang );

    }

    controller = options.register( wLib.interface( 'map', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    controller.getControlData( function( data ) {

      if ( !data.ebd || data.ebd.dcss ) styler( style );

      _createCalendar();

    })

  },

  enable = function( reqParams ) {

    selection = false;

    enabled = true;

    if ( reqParams.from ) {

      log( 'setting from at %s', reqParams.from );

      selection = new Date( reqParams.from );

    }

    if ( reqParams.to ) {

      log( 'setting to at %s', reqParams.to );

      selection = {
        begin : selection,
        end : new Date( reqParams.to )
      };

    }

    _refresh();

  },

  clear = function() {

    existingDates = [];

    if ( calendar ) calendar.setSelected( false );

  },

  include = function( eventItem ) {

    for ( var i in eventItem.l ) {

      for ( var j = eventItem.l[ i ].d.length - 1; j >= 0; j-- ) {

        if ( !cn.contains( existingDates, eventItem.l[i].d[j]) ) {

          existingDates.push( eventItem.l[i].d[j] );

        }

      }

    }

  },

  disable = function() {

    log( 'disabling calendar' );

    enabled = false;

    _refresh();

  },

  _update = function( selection ) {

     log( 'updating request parameters' );

      controller.update( 'calendar', {

        from: [
          selection.begin.getFullYear(),
          ( selection.begin.getMonth() < 9 ? '0' : '' ) + ( selection.begin.getMonth() + 1 ),
          ( selection.begin.getDate() < 10 ? '0' : '' ) + selection.begin.getDate()
        ].join( '-' ),

        to: [
          selection.end.getFullYear(),
          ( selection.end.getMonth() < 9 ? '0' : '' ) + ( selection.end.getMonth() + 1 ),
          ( selection.end.getDate() < 10 ? '0' : '' ) + selection.end.getDate()
        ].join( '-' )

      } );

  },


  /**
   * create calendar
   */

  _createCalendar = function() {

    elem.innerHTML = new EJS( { text: templates.main } ).render( {} );

    calendar = new cLib.CibulCalendar( cn.el( elem, 'div' ), {
      filter: function( date, classes ) {

        return _filterCalendar( date, classes );
        
      },
      onSelect: _update,
      navDomContent: { prev: '<', next: '>'},
      lang: lang
    } );

  },

  _filterCalendar = function( date, classes ) {

    var formattedDate = [ 

      date.getFullYear(),

      ( date.getMonth() < 9 ? '0' : '' ) + ( date.getMonth() + 1 ),

      ( date.getDate() < 10 ? '0' : '' ) + date.getDate()

    ].join( '-' );

    if ( cn.contains( existingDates, formattedDate ) ) {

      classes.push( 'hasdates' );

    }

    return classes;

  },

  _refresh = function() {

    calendar.setSelected( selection, false );

    // TWEAK - to force refresh on selection - this should be corrected at the calendar level
    
    if ( !selection ) {

      calendar.showNext();
      calendar.showPrevious();

    }

    if ( enabled ) {

      calendar.enable();

    } else {

      calendar.disable();

    }

  };

  init();

}

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgcl', { register: register }, widget );

} );
"use strict";

exports.setOnReady = setOnReady;

var UID = 0, LANG = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

cLib = require( '../../js/vendors/CibulCalendar/src/CibulCalendar' ),

debug = require( 'debug' ),

config = {
  langAttribute : 'data-lang'
},

templates = {
  main : require( './main.ejs' )
},

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

onReady;


if ( cn.contains( [ 'tpl', 'development' ], window.env ) ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  controller,

  enabled = false,

  lang = 'en',

  calendar,

  activeDates = [],

  existingDates = [],

  selection = false,

  firstEnable = true;

  // init settings, register widget, fetch control data, create calendar

  ( function() {

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

    controller = options.register( wLib.interface( 'calendar', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    controller.getControlData( function( data ) {

      if ( data.ebd && data.ebd.dcss ) styler( style );

      existingDates = _getAllDates( data );

      _createCalendar();

      controller.onWidgetReady( 'calendar', { uid } );

      if ( onReady ) onReady();

    });

  } )();


  function enable( reqParams ) {

    log( 'enabling' );

    if ( firstEnable ) {

      _setCalendarPosition();

    }

    firstEnable = false;

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

  }


  function clear() {

    activeDates = [];

    if ( calendar ) calendar.setSelected( false );

  }


  function include( eventItem ) {

    for ( var i = eventItem.d.length - 1; i >= 0; i-- ) {
      
      if ( !cn.contains( activeDates, eventItem.d[ i ]) ) {

        activeDates.push( eventItem.d[ i ] );

      }

    }

  }


  function disable() {

    log( 'disabling calendar' );

    enabled = false;

    _refresh();

  }


  function _onSelect( newSelection ) {

    // filter out unique date selection only
    
    var newRange = {
      from: _dStringify( newSelection.begin ),
      to: _dStringify( newSelection.end )
    },

    isRelevent = false;

    for ( var i = 0; i < existingDates.length; i++ ) {

      if ( ( existingDates[ i ] <= newRange.to )

      && ( existingDates[ i ] >= newRange.from ) ) {

        isRelevent = true;

        break;

      }

    }

    if ( !isRelevent ) {

      calendar.setSelected( selection );

    } else {

      _update( newRange );

    }

  }


  function _update( range ) {

    log( 'updating request parameters' );

    controller.update( 'calendar', range );

  }


  /**
   * create calendar
   */

  function _createCalendar() {

    elem.innerHTML = templates.main( {} );

    calendar = new cLib.CibulCalendar( cn.el( elem, 'div' ), {
      filter: _filterCalendar,
      onSelect: _onSelect,
      navDomContent: { prev: '<', next: '>'},
      lang: lang
    } );

  }


  function _setCalendarPosition() {

    var now = new Date(),

    closestDates = [ false, false ],

    refDate;

    now = now.getFullYear() + '-' + _fZ( now.getMonth() + 1 ) + '-' + _fZ( now.getDate() ),

    cn.forEach( activeDates, function( d ) {

      if ( d >= now ) {

        if ( !closestDates[ 1 ] || ( d < closestDates[ 1 ] ) ) {

          closestDates[ 1 ] = d;

        }

      } else {

        if ( !closestDates[ 0 ] || ( d > closestDates[ 0 ] ) ) {

          closestDates[ 0 ] = d;

        }

      }

    } );

    refDate = closestDates[ 1 ] ? closestDates[ 1 ] : closestDates[ 0 ];

    if ( !refDate ) return;

    if ( refDate.substr( 0, 7 ) == now.substr( 0, 7 ) ) {

      return;

    }

    // reference date is different from current month.

    calendar.setDisplayedMonth( new Date( refDate ) );


  }


  function _filterCalendar( date, classes ) {

    var formattedDate = [ 

      date.getFullYear(),

      ( date.getMonth() < 9 ? '0' : '' ) + ( date.getMonth() + 1 ),

      ( date.getDate() < 10 ? '0' : '' ) + date.getDate()

    ].join( '-' );

    if ( activeDates.indexOf( formattedDate ) !== -1 ) {

      classes.push( 'hasdates' );

    }

    if ( existingDates.indexOf( formattedDate ) !== -1 ) {

      classes.push( 'exists' );

    }

    return classes;

  }


  function _refresh() {

    if ( !calendar ) return;

    calendar.setSelected( selection, false );

    if ( enabled ) {

      calendar.enable();

    } else {

      calendar.disable();

    }

    // TWEAK - to force refresh on selection - this should be corrected at the calendar level
    
    if ( !selection ) {

      calendar.showNext();
      calendar.showPrevious();

    }

  };

}

function _getAllDates( data ) {

  var dates = {}, datesArr = [];

  for ( var i in data.ev ) {

    cn.forEach( data.ev[ i ].d, function( d ) {

      dates[ d ] = 1;

    } );

  }

  for ( var d in dates ) {

    datesArr.push( d );

  }

  return datesArr;

}

function _dStringify( d ) {

  return [ d.getFullYear(), _fZ( d.getMonth() + 1), _fZ( d.getDate() ) ].join( '-' );

}

function _fZ( n ) {

  return (n>9?'':'0') + n;

};

function setOnReady( cb ) {

  onReady = cb;

}

require( '../lib/loader' )( {
  selector: '.cbpgcl',
  widget: widget,
  backup: {
    selector: '[data-oacl]',
    classNames: 'cibulCalendar'
  }
} );
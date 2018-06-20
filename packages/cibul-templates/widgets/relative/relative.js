"use strict";

const _ = {
  head: require( 'lodash/head' )
}
const debug = require( 'debug' );


const flattenLabels = require( '@openagenda/labels/flatten' );
const labels = require( '@openagenda/labels/widgets/relative' );
const Parser = require( '@openagenda/tumblr-parser' )
const utils = require( '@openagenda/utils' );

const wLib = require(  '../lib/widgetLib' );

const cn = require(  '../../js/lib/common/common.mod.js' );
const map = require( './template.map.json' );
const tpl = require( './relative.tblr' );


const UID = 0;
const LANG = 1;

let onReady;

if ( cn.contains( [ 'tpl', 'development' ], window.env ) ) debug.enable( '*' );

function widget( elem, options ) {

  const uid = options.anchorConfig[ UID ];

  const lang = options.anchorConfig[ LANG ];

  const widgetLabels = flattenLabels( labels, lang );

  const log = debug( 'relative widget ' + uid );

  let enabled = false;

  log( 'initing' );

  const controller = options.register( wLib.interface( 'relative', uid, {
    enable,
    disable
  } ) );

  _renderAndBehave( selected => {

    if ( !enabled ) return;

    const updatedRequestParams = ( {
      today: {
        from: getDateString( new Date ),
        to: null
      },
      tomorrow: {
        from: getDateString( getTomorrow() ),
        to: null
      },
      this_weekend: {
        from: getDateString( getWeekDate( 5 ) ),
        to: getDateString( getWeekDate( 6 ) )
      },
      this_week: {
        from: getDateString( getMondayOf() ),
        to: getDateString( getWeekDate( 6 ) )
      },
      this_month: {
        from: getDateString( getFirstMonthDate() ),
        to: getDateString( getLastMonthDate() )
      }
    } )[ selected ];

    controller.update( 'relative', updatedRequestParams );

  } );

  controller.getControlData( data => {

    log( 'fetched controller data' );

    log( 'init complete, enable to render' );

    controller.onWidgetReady( 'relative', { uid } );

    if ( onReady ) onReady();

  } );

  function enable( reqParams = {} ) {

    enabled = true;

  }

  function disable() {

    enabled = false;

  }

  function _renderAndBehave( onClick ) {

    const parser = Parser( map );

    parser.load( tpl );

    elem.innerHTML = parser.render( widgetLabels );

    cn.forEach( cn.els( elem, 'a' ), link => {

      cn.addEvent( link, 'click', e => {

        cn.preventDefault( e );

        const code = _.head( link.className.split( ' ' ).filter( cls => cls.substr( 0, 3 )=== 'js_' ) );

        if ( code ) onClick( code.substr( 3 ) );

      } );

    } );

  }

}

function setOnReady( cb ) {

  onReady = cb;

}

function getWeekDate(offset) {

  var monday = getMondayOf();

  var weekDate = new Date( monday );

  weekDate.setDate(monday.getDate() + offset);

  return weekDate;
  
}

function getIndexFromMonday( d ) {

  if ( !d ) d = new Date();

  return (d.getDay() + 6) % 7;

}

function getMondayOf( d ) {

  if ( !d ) d = new Date();

  var monday = new Date( d );

  monday.setDate(d.getDate() - getIndexFromMonday(d) );

  return monday;

}

function getTomorrow() {

  var d = new Date();

  d.setDate(d.getDate() + 1);

  return d;

}

require( '../lib/loader' )( {
  selector: '.cbpgrl',
  widget: widget,
  backup: {
    selector: '[data-oarl]',
    classNames: 'oaRelative'
  }
} );

function getDateString( d ) {

  return [ d.getFullYear(), utils.fZ( d.getMonth() + 1 ), utils.fZ( d.getDate() ) ].join( '-' );

}

function getFirstMonthDate() {

  const d = new Date();

  d.setDate( 1 );

  return d;

}

function getLastMonthDate() {

  const d = new Date();

  d.setDate( 1 );

  d.setMonth( d.getMonth() + 1 );

  d.setDate( d.getDate() - 1 );

  return d;

}

var cn = require( '../../js/lib/common' ),

cLib = require( '../../js/vendors/CibulCalendar/src/CibulCalendar' ),

lightbox = require('../../js/lib/lightbox'),

lb, // lightbox instance

params = {
  selectors: {
    totalsSearch: '.js_totals_search',
    searchBegin: '.js_begin',
    searchEnd: '.js_end'
  },
  classes: {
    lightbox: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas',
      buttonBox: 'lightbox-buttons',
      body: 'noscroll'
    }
  },
  res: {
    search: '/admin/search'
  }
};

module.exports = function() {

  _calendarSearch();

};

function _calendarSearch() {

  cn.el( params.selectors.totalsSearch ).setAttribute( 'style', 'display: none;' );

  var b = _createButton( { appendAfter: cn.el( params.selectors.totalsSearch ) } );

  // open lightbox on click
  cn.addEvent( b, 'click', function() {

    lightbox({
      onOpen: _showCalendar,
      buttons: false,
      classes: params.classes.lightbox
    });

  } );

}

function _updateSearch( sel ) {

  cn.el( params.selectors.searchBegin ).value = _fZ(sel.begin.getDate()) + '-' + _fZ( sel.begin.getMonth() + 1 ) + '-' + _fZ( sel.begin.getFullYear() );

  cn.el( params.selectors.searchEnd ).value = _fZ(sel.end.getDate()) + '-' + _fZ( sel.end.getMonth() + 1 ) + '-' + _fZ( sel.end.getFullYear() );

  cn.el( params.selectors.totalsSearch ).submit();

}

function _createButton( options ) {

  var div = document.createElement('div'),

  button;

  div.innerHTML = '<div class="cform"><button><i class="fa fa-calendar-o"></i></button></div>';

  button = cn.childObject( div, 0 );

  options.appendAfter.insertAdjacentElement( 'afterend', button );

  return button;

}

function _showCalendar( frameElem, lb ) {

  new cLib.CibulCalendar( frameElem, {
    onSelect: _updateSearch,
    navDomContent: { prev: '<', next: '>'},
    lang: 'fr'
  } );

  lb.reposition();

}

function _fZ( n ) {
  return (n>9?'':'0') + n;
};

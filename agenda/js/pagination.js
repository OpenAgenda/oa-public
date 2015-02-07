"use strict";

var cn = require( '../../js/lib/common/common.mod' ),

remote = require( '../../js/lib/remote/remote.mod' ),

debug = require( 'debug' ), log,

qs = require( 'qs' ),

params = {
  loadNext: false, // cb to get next page content
  loadPrev: false, // cb to get previous page content
  auto: true,      // loads next page on bottom hit
  selectors: {
    pager: '.js_pages',
    list: '.js_list_content',
    previous: '.js_previous_page'
  },
  classes: {
    displayNone: 'display-none'
  }
},

page = 1,

loading = false,

prevPageExists = true;

module.exports = {
  init: init,
  reset: reset,
  loadNext: loadNext
}

function init( options ) {

  log = debug( 'pagination' );

  cn.extend( params, options );

  log( 'initing with params %s', JSON.stringify( options ) );

  _readPage( params.href );

  _hidePager();

  _initPrevPage( params.href );

  if ( params.auto ) {

    _onHitBottom( loadNext );

  }

}

function reset( newHref, total ) {

  params.total = total;

  params.href = newHref;

  _removePrevPage();

  page = 1;

  loading = false;

}

function loadNext( cb ) {

  log( 'loading next' );

  var newHref;

  if ( loading ) {

    log( 'already loading' );

    return cb ? cb( 'already loading' ) : null;

  }

  loading = true;

  if ( page * params.perPage >= params.total ) {

    log( 'last page already reached: %s', page );

    return cb ? cb( 'last page already reached' ) : null;

  }

  newHref = _setHrefPage( params.href, page + 1 );
  

  params.loadNext( newHref, function( err, data ) {

    loading = false;

    page += 1;

    if ( cb ) cb( err );

  } );

}


function _onHitBottom( cb ) {

  var offset,

  body = cn.el( 'body' );

  cn.addEvent( document, 'scroll', function() {

    var scrollPos = cn.getScrollOffsets().y,

    pageBottom = body.offsetHeight,

    windowHeight = cn.windowInnerHeight();

    if ( pageBottom - windowHeight < scrollPos ) {

      cb();

    }

  });

}


function _hidePager() {

  cn.forEach( cn.els( params.selectors.pager ), function( pagerElem ) {

    cn.addClass( pagerElem, params.classes.displayNone );

  } );

}


function _setHrefPage( href, newPage ) {

  var parts = href.split( '?' ),

  queryString = ( parts.length == 1 ) ? '' : parts[1].split( '#' )[0],

  query = qs.parse( queryString );

  query.page = newPage;

  return parts[0] + '?' + qs.stringify( query );

}


function _initPrevPage( href ) {

  var firstPage = page;

  if ( firstPage > 1 ) {

    cn.addEvent( cn.el( params.selectors.previous ), 'click', function( ) {

      params.loadPrev( _setHrefPage( href, firstPage - 1 ), function( err, data ) {

        loading = false;

        firstPage -= 1;

        if ( firstPage == 1 ) {

          _removePrevPage();

        }

      } );

    } );

    cn.removeClass( cn.el( params.selectors.previous ), params.classes.displayNone );    

  } else {

    _removePrevPage();

  }


}


function _removePrevPage() {

  if ( prevPageExists ) {

    cn.el( params.selectors.previous ).parentNode.removeChild( cn.el( params.selectors.previous ) );

    prevPageExists = false;

  }

}


function _readPage( href ) {

  var parts = href.split( '?' ),

  query = {};

  if ( parts.length == 1 ) {

    page = 1;

    return;

  }

  query = qs.parse( parts[1].split( '#' )[0] );

  if ( query.page ) {

    page = parseInt( query.page, 10 );

  } else {

    page = 1;

  }

}
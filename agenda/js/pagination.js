var cn = require( '../../js/lib/common/common.mod' ),

remote = require( '../../js/lib/remote/remote.mod' ),

qs = require( 'qs' ),

params = {
  loader: false, // content loader
  selectors: {
    pager: '.js_pages',
    list: '.js_list_content'
  },
  classes: {
    displayNone: 'display-none'
  }
},

page = 1,

loading = false;

exports.init = function( options ) {

  cn.extend( params, options );

  _readPage( params.href );

  _hidePager();

  _onHitBottom( _loadNext );

}


exports.reset = function( newHref, total ) {

  params.total = total;

  params.href = newHref;

  page = 1;

  loading = false;

}


function _loadNext() {

  var newHref;

  if ( loading ) {

    return;

  }

  loading = true;

  if ( page * params.perPage >= params.total ) {

    return;

  }

  newHref = _updateHrefPage( params.href, page + 1 );
  

  params.loader.after( newHref, function( err, data ) {

    loading = false;

    page += 1;

  } );

}


function _onHitBottom( cb ) {

  var offset

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


function _updateHrefPage( href, newPage ) {

  var parts = href.split( '?' ),

  queryString = ( parts.length == 1 ) ? '' : parts[1].split( '#' )[0],

  query = qs.parse( queryString );

  query.page = newPage;

  return parts[0] + '?' + qs.stringify( query );

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
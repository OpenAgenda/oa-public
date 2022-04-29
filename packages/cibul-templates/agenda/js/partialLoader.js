var remote = require( '../../js/lib/remote' ),

cn = require( '../../js/lib/common' ),

log = require( 'debug' )( 'partialLoader' ),

qs = require( 'qs' ),

defaults = {
  canvas: false, // canvas elem where content is loaded
  href: false, // this is the href loaded
  raw: false,   // response should be considered as raw data
  decorate: {},  // response should be decorated with this
  preventBrowserCache: true,
  onLoad: false
};


module.exports = function( options ) {

  var params = cn.extend( {}, defaults, options ),

  init = function() {

    log( 'initing' );

    return {
      replace: _action( 'replace' ),
      after: _action( 'after' ),
      before: _action( 'before' )
    }

  },

  _action = function( name ) {

    return function( href, cb ) {

      _get( href, function( err, data ) {

        if ( err ) {

          return cb( err );

        }

        _dom[ name ]( data );

        if ( cb ) cb( null, data );

        if ( params.onLoad ) params.onLoad( null, data );

      });

    }

  },

  _dom = {

    replace: function( data ) {

      _clear( params.canvas );

      params.canvas.innerHTML = data.partial;

    },

    after: function( data ) {

      params.canvas.insertAdjacentHTML( 'beforeend', data.partial );

    },

    before: function( data ) {

      params.canvas.insertAdjacentHTML( 'afterbegin', data.partial );

    }

  },

  _get = function( href, cb ) {

    var settings = {};

    if ( params.raw ) {

      settings.raw = true;

    }

    if ( params.preventBrowserCache ) {

      settings.data = { preventCache: Math.random() };

    }

    if ( window.env == 'tpl' ) href = _templateHref( href );

    remote.getXmlHttp( href, settings, function( responseType, data ) {

      var response = {};

      if ( responseType !== 'success' ) {

        cb( responseType );

        return;

      }

      if ( params.raw ) {

        response.partial = data;

      } else {

        response = data;

      }

      if ( params.decorate ) {

        cn.extend( response, options.decorate );

      }

      cb( null, response );

    });

  };

  return init();

};




function _clear( elem ) {

  var child;

  while ( child = cn.childObject( elem, 0 ) ) {

    elem.removeChild( child );

  }

}


/**
 * fetch partial directly in template mode
 */

function _templateHref( href ) {

  var parts = href.split( '?' );

  return parts[0].replace('embedS', 's' ) + '.part' + ( parts.length == 2 ? '?' + parts[1] : '' );

}

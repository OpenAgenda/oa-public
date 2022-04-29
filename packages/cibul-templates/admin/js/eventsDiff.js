var cn = require( '../../js/lib/common' ),

fetch = require( './fetch' ),

params = {
  selectors: {
    main: '.js_events_diff'
  },
  res: {
    all: '/admin/eventsdiff',
    tpl: '/server/testdata/admineventdiff.json'
  }
},

res = typeof params.res[ window.env ] !== 'undefined' ? params.res[ window.env ] : params.res.all;

module.exports = function() {

  fetch( res, function( err, data ) {

    if ( err ) return console.log( err );

    _render( data );

  });

}

function _render( data ) {

  cn.el( params.selectors.main ).innerHTML = data.diff;

}

var d3 = require( 'd3' ),

cn = require( '../../js/lib/common' ),

fetch = require( './fetch' ),

params = {
  selectors: {
    main: '.js_events_by_week'
  },
  res: {
    all: '/admin/eventsbyweek',
    tpl: '/server/testdata/grapheventsbyweek.json'
  }
},

res = typeof params.res[ window.env ] !== 'undefined' ? params.res[ window.env ] : params.res.all;

module.exports = function() {

  fetch( res, function( err, data ) {

    if ( err ) return console.log( err );

    _render( data.data );

  });

}

function _render( data ) {

  var y = d3.scale.linear()
  .domain( [ 0, d3.max( data.map( function( d ) { return d.v } ) ) ] )
  .range([ 0, 300 ]);

  d3.select(".js_events_by_week")
  .select( 'ul' )
  .selectAll( 'li' )
  .data( data )
  .enter().append( 'li' )
  .style( 'width', function( d ) { return ( 1 / ( data.length / 100 ) ) + "%"; } )
  .append( 'div' )
  .style( 'height', function( d ) { return y( d.v ) + "px"; } )
  .append( 'label' )
  .text( function( d ) { return d.l; } )
  .insert( 'span' )
  .text( function( d ) { return d.v; } );

}

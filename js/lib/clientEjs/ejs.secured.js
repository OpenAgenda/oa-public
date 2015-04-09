var EJS = require( './ejs' );

module.exports = {
  render: render
}

function render( template, data ) {

  var escaped = _removeOnload( data );

  return new EJS( { text: template } ).render( escaped );

}

function _removeOnload( data ) {

  var escaped = {};

  for ( var i in data ) {

    if ( typeof data[ i ] == 'string' ) {

      escaped[ i ] = data[ i ].replace( /onload=/g, '' );

    } else {

      escaped[ i ] = data[ i ];

    }

  }

  return escaped;

}
var fs = require( 'fs' ),

translations = {};

['fr'].forEach( function( lang ) {

  translations[ lang ] = JSON.parse( fs.readFileSync( __dirname + '/' + lang + '.json', "utf8") );

} );

module.exports = function( label, values, lang ) {

  var translation;

  if ( arguments.length === 1 ) {

    lang = false;

    values = {};

  } else if ( ( arguments.length === 2 ) && ( typeof values == 'string' ) ) {

    lang = values;

    values = {};

  } else if ( arguments.length === 2 )  {

    lang = false;

  }

  if ( lang && ( lang !== 'en' ) ) {

    translation = translations[ lang ][ label ] || label;

  } else {

    translation = label;

  }

  for (var key in values) {

    translation = translation.replace(key, values[key]);

  }

  return translation;

};
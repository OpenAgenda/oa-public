module.exports = function( options ) {

  return function( __, data, useLinks ) {

    var mappedLabels = {}, k;

    for( k in data.values ) {

      if ( useLinks ) {

        mappedLabels[ k ] = '<a href="${data.values[k].link}">${data.values[k].label}</a>';

      } else {

        mappedLabels[ k ] = data.values[ k ].label;

      }

    }

    return __( data.text, mappedLabels );

  }

}
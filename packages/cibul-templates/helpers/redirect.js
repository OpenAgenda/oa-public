var b64 = require( '../js/lib/Base64/Base64.mod.js' );

module.exports = function() {

  return makeRedirect;

  function makeRedirect( values ) {

    return b64.encode( JSON.stringify( values ) );

  }

}
var b64 = require( '../js/lib/Base64' );

module.exports = function() {

  return makeRedirect;

  function makeRedirect( values ) {

    return b64.encode( JSON.stringify( values ) );

  }

}

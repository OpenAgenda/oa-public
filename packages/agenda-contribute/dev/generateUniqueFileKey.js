"use strict";

/**
 * this better be handled by dedicated service
 */
module.exports = () => {

  return new Promise( rs => rs( 'thisisauniquefilekey' ) );

}

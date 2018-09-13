"use strict";

// will need to do something more generalised for this

const uuidV4 = require( 'uuid/v4' );

module.exports = () => new Promise( rs => rs( uuidV4().replace( /\-/g, '' ) ) );

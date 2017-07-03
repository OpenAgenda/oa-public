"use strict";

module.exports = {
  setTo: ( target, field, override = true ) => v => {

    if ( override || !( v[ target ][ field ] instanceof Date ) ) {

      v[ target ][ field ] = new Date();

    }

    return v;

  }
}
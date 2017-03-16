"use strict";

module.exports = {
  setTo: ( target, field ) => v => {

    v[ target ][ field ] = new Date();

    return v;

  }
}
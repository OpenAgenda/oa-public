"use strict";

const init = require( '../service/init' );

const makeValidatorFields = require( './makeValidatorFields' );
const slowTransfer = require( './slowTransfer' );

module.exports = { 
  makeValidatorFields,
  slowTransfer,
  init: ( svc, c ) => {

    slowTransfer.init( svc, c );

  }
}
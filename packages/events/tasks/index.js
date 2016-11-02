"use strict";

const init = require( '../service/init' );

const makeValidatorFields = require( './makeValidatorFields' );
const transferLegacyData = require( './transferLegacyData' );

module.exports = { 
  makeValidatorFields,
  transferLegacyData,
  init: ( svc, c ) => {

    transferLegacyData.init( svc, c );

  }
}
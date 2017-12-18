"use strict";

const get = require( './get' );

module.exports = agendaUid => {

  return {
    get: get.bind( null, agendaUid )
  }

}
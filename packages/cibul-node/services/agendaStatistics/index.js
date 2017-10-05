"use strict";

const db = require( './lib/db' );

module.exports = async agendaUid => {

  return {
    db: await db( agendaUid ),
    legacySearch: null,
    search: null
  }

}
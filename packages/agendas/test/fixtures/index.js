"use strict";

const fixtures = require( 'fixtures' );

let config;

module.exports = build;

module.exports.init = c => {

  config = c;

  fixtures.init( { mysql: config.mysql } );

};


function build( cb ) {

  fixtures( [ {
    table: config.schemas.agenda,
    src: __dirname + '/agenda.data.sql'
  }, {
    table: config.schemas.agendaEvent,
    src: __dirname + '/agenda_event.data.sql'
  }, {
    table: config.schemas.occurrence,
    src: __dirname + '/occurrence.data.sql'
  }, {
    table: config.schemas.legacyCredentialSet,
    src: __dirname + '/legacy_credential_set.data.sql'
  } ], cb );

}
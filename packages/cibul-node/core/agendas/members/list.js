"use strict";

const members = require( '../../../services/members' );

module.exports = ( agendaUid, query, nav, options = {} ) => members.list(
  Object.assign( {}, query || {}, { agendaUid } ),
  nav,
  options
);

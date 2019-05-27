"use strict";

const agendas = require( '@openagenda/agendas' );

const events = require( './events' );
const settings = require( './settings' );
const create = require( './create' );
const update = require( './update' );

const listMembers = require( './members/list' );

module.exports = Object.assign( agendaUid => {

  return {
    get: agendas.get.bind( null, { uid: agendaUid } ),
    update: update.bind( null, agendaUid ),
    events: events( agendaUid ),
    members: Object.assign( listMembers.bind( null, agendaUid ), {
    } ),
    settings: settings( agendaUid )
  }

}, {
  create
} );

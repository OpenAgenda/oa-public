"use strict";

const agendas = require( '@openagenda/agendas' );

const events = require( './events' );
const Settings = require( './settings' );
const create = require( './create' );
const update = require( './update' );
const remove = require( './remove' );

const listMembers = require( './members/list' );

module.exports = services => {
  const settings = Settings(services);

  return Object.assign(agendaUid => ({
    get: agendas.get.bind( null, { uid: agendaUid } ),
    update: update.bind(null, services, agendaUid),
    remove: remove.bind( null, agendaUid ),
    events: events(services, agendaUid),
    members: Object.assign( listMembers.bind( null, agendaUid ), {
    } ),
    settings: settings(agendaUid)
  }), { create });
}

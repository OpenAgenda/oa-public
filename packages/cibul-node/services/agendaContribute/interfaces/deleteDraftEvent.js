"use strict";

const _ = require( 'lodash' );

module.exports = async (services, agenda, user, event) => {
  const {
    core
  } = services;

  if ( !_.get( event, 'draft' ) ) throw new Error( 'Event is not a draft' );

  const result = await core.agendas( agenda.uid ).events.remove( event.uid );

  return result.success === true;

}

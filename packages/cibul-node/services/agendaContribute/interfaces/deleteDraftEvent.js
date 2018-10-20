"use strict";

const _ = require( 'lodash' );

const core = require( '../../../core' );

module.exports = async ( agenda, user, event ) => {

  if ( !_.get( event, 'draft' ) ) throw new Error( 'Event is not a draft' );

  const result = await core.agendas( agenda.uid ).events.remove( event.uid );

  return result.success === true;

}

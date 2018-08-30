"use strict";

const pickScenario = require( './pickScenario' );

module.exports = async ( agenda, user, current, data ) => {

  console.log( 'setMember interface received data for agenda %s and user %s', agenda.slug, user.name, data );

  // will need this when there is a scenario that fails
  const scenario = pickScenario( { agenda } );

  return new Promise( rs => rs( true ) );

}

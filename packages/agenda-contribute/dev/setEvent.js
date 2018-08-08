"use strict";

const _ = require( 'lodash' );

const pickScenario = require( './pickScenario' );

module.exports = async ( agenda, user, current, data ) => {

  console.log( 'setEvent interface received data for agenda %s and user %s', agenda.slug, user.name, data );

  // will need this when there is a scenario that fails
  const scenario = pickScenario( agenda.slug );

  // response should contain created or updated event
  return {
    event: _.extend( data, {
      uid: 123456,
      slug: 'a-new-event'
    } )
  };

}
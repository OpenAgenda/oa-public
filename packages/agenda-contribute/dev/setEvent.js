"use strict";

const _ = require( 'lodash' );

const pickScenario = require( './pickScenario' );

module.exports = async ( agenda, user, current, data, files, options = {} ) => {

  console.log( 'setEvent interface received data for agenda %s and user %s', agenda.slug, user.name, data );

  // will need this when there is a scenario that fails
  const scenario = pickScenario( { agenda } );

  // response should contain created or updated event
  return new Promise( rs => rs( {
    event: _.assign( data, {
      uid: 123456,
      slug: 'a-new-event',
      draft: !!options.draft
    } )
  } ) );

}

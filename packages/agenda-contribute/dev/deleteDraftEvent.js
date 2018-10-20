"use strict";

const _ = require( 'lodash' );

module.exports = async ( agenda, user, draftEvent ) => {

  console.log( 'deleteDraft event called for event %s', draftEvent.uid );

  return new Promise( rs => rs() );

}

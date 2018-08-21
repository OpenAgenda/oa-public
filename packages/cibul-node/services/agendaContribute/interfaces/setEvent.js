"use strict";

module.exports = async ( agenda, user, current, data ) => {

  current === null // create

  console.log( 'agenda', agenda );
  console.log( 'user', user );
  console.log( 'current', current );
  console.log( 'data', data );

  return {};

}

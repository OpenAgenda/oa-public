"use strict";

module.exports = ( currentChecked, check, language ) => {

  let checked = currentChecked.concat( [] );

  if ( check ) {

    checked.push( language );

  } else {

    checked.splice( checked.indexOf( language ), 1 );

  }

  return checked;

}
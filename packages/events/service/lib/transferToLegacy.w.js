"use strict";

module.exports = ( service, v ) => {

  if ( !v.id ) return v;

  return service.legacy.update( { id: v.id } ).then( result => {

    v.transferedToLegacy = !!result.success;

    return v;

  } );

}
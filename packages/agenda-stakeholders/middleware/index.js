"use strict";

var service = require( '../service' );

module.exports = {
  loadAgenda: loadAgenda
}

function loadAgenda( agendaNamespace, serviceNamespace ) {

  return ( req, res, next ) => {

    req[ serviceNamespace ] = service( req[ agendaNamespace ].id );

    next();

  }

}

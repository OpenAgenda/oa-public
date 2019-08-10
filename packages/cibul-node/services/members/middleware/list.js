"use strict";

const ih = require( 'immutability-helper' );

module.exports = async ( members, req, res, next ) => {
  res.json( await members.list( ih( req.query, {
    agendaUid: { $set: req.agenda.uid },
    deletedUser: { $set: null }
  } ), Object.assign( {}, req.query, { order: req.order } ), {
    legacy: true,
    detailed: true,
    total: true
  } ) );
}

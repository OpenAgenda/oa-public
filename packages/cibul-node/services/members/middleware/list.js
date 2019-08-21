"use strict";

const ih = require( 'immutability-helper' );

module.exports = async ( members, req, res, next ) => {
  res.json( await _list( members, req, req.query, req.order ) );
}

module.exports.stats = async ( members, req, res, next ) => {
  _list( members, req, { limit: 0 } ).then( ( {
    totalPerRole,
    total
  } ) => res.json( {
    totalPerRole,
    total
  } ) );
}

function _list( members, req, query = {}, order = null ) {
  return members.list( ih( query, {
    agendaUid: { $set: req.agenda.uid },
    deletedUser: { $set: null }
  } ), Object.assign( {}, query, { order } ), {
    detailed: true,
    total: true
  } );
}

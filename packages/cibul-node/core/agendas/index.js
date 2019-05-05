"use strict";

const _ = require( 'lodash' );

const events = require( './events' );
const settings = require( './settings' );
const create = require( './create' );

module.exports = _.assign( agendaUid => {

  return {
    events: events( agendaUid ),
    settings: settings( agendaUid )
  }

}, {
  create
} );

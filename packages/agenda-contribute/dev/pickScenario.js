"use strict";

const _ = require( 'lodash' );
const scenarios = require( '../scenarios.dev' );

module.exports = req => {

  const agendaSlug = req.agenda ? req.agenda.slug : req.originalUrl.split( '/' )[ 1 ];

  return _.first( scenarios.filter( sc => sc.agenda.slug === agendaSlug ) );

}

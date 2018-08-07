"use strict";

const _ = require( 'lodash' );
const scenarios = require( '../scenarios.dev' );

module.exports = ( reqOrAgendaSlug ) => {

  const agendaSlug = _.isObject( reqOrAgendaSlug ) ? reqOrAgendaSlug.agenda.slug : reqOrAgendaSlug;

  return _.first( scenarios.filter( sc => sc.agenda.slug === agendaSlug ) );

}
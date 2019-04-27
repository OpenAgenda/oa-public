"use strict";

module.exports = [ {
  name: 'Default',
  description: 'A working setup',
  slug: 'default',
  config: require( './000_default' ),
  req: { lang: 'fr' }
}, {
  name: 'Networks load fails',
  description: 'Shows a relevent error message',
  slug: 'networks-error',
  config: require( './100_networksError' )
}, {
  name: 'Network detail load fails',
  description: 'Shows a relevent error message',
  slug: 'network-error',
  config: require( './101_networkError' )
}, {
  name: 'Agendas load fails',
  description: 'A failing load',
  slug: 'agendas-error',
  config: require( './102_agendasError' ),
  req: { lang: 'fr' }
}, {
  name: 'Network schema save fails',
  description: 'A relevent message appears',
  slug: 'network-schema-save-fail',
  config: require( './103_schemaUpdateError' )
}, {
  name: 'Agenda add to network fails',
  description: 'An attempt to add an agenda fails',
  slug: 'agenda-add-fail',
  config: require( './104_agendaAddError' )
} ];

"use strict";

module.exports = [ {
  name: 'Default',
  description: 'A working setup',
  slug: 'default',
  config: require( './default' ),
  req: { lang: 'fr' }
}, {
  name: 'Agendas load fails',
  description: 'A failing load',
  slug: 'agendas-error',
  config: require( './agendasError' ),
  req: { lang: 'fr' }
} ];

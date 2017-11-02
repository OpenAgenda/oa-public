"use strict";

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

module.exports = {
  services: {
    location: require( './services/location' ),
    event: require( './services/event' ),
    agenda: require( './services/agenda' ),
    embed: require( './services/embed' ),
    nominatim: require( './services/nominatim' ),
    agendas: require( 'agendas' ),
    categories: require( 'agenda-categories' ),
    locations: require( 'agenda-locations' ),
    agendaSearch: require( 'agenda-search' ),
    stakeholders: require( 'agenda-stakeholders' ),
    tags: require( 'agenda-tags' ),
    files: require( '@openagenda/files' ),
    images: require( 'images' ),
    mailer: require( 'mailer' ),
    users: require( 'users' )
  },
  config: require( './config' ),
  init: require( './services/init' ),
  modelLib: require( './services/model' )
};

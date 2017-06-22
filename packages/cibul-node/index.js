"use strict";

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
    files: require( 'files' ),
    images: require( 'images' ),
    mailer: require( 'mailer' ),
    users: require( 'users' )
  },
  config: require( './config' ),
  init: require( './services/init' ),
  modelLib: require( './services/model' )
};

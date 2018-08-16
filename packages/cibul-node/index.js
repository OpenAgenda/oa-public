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
    agendas: require( '@openagenda/agendas' ),
    categories: require( '@openagenda/agenda-categories' ),
    locations: require( '@openagenda/agenda-locations' ),
    agendaSearch: require( '@openagenda/agenda-search' ),
    stakeholders: require( '@openagenda/agenda-stakeholders' ),
    tags: require( '@openagenda/agenda-tags' ),
    files: require( '@openagenda/files' ),
    images: require( '@openagenda/images' ),
    mails: require( '@openagenda/mails' ),
    users: require( '@openagenda/users' )
  },
  config: require( './config' ),
  init: require( './services/init' ),
  modelLib: require( './services/model' )
};

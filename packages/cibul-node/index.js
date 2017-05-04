"use strict";

module.exports = {
  services: {
    location: require( './services/location' ),
    event: require( './services/event' ),
    agenda: require( './services/agenda' ),
    embed: require( './services/embed' ),
    nominatim: require( './services/nominatim' ),
    images: require( 'images' ),
    files: require( 'files' ),
    tags: require( 'agenda-tags' ),
    locations: require( 'agenda-locations' ),
    categories: require( 'agenda-categories' ),
    users: require( 'users' ),
    stakeholders: require( 'agenda-stakeholders' )
  },
  config: require( './config' ),
  init: require( './lib/init' ),
  modelLib: require( './services/model' )
};

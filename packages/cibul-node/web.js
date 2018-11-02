"use strict";

const webModules = [
  require( './home/back' )( '/home' ),
  require( './user/settings.front' )( '/settings' ),
  require( './general/front' )( '' ),
  require( './general/session.back' )( '/session' ),
  require( './general/back' )( '' ),
  require( './search/front' )( '' ),
  require( './event/form.back' )( '' ),
  require( './event/tagsForm.back' )( '/:slug/events/:eventSlug/tagcat' ),
  require( './event/back' )( '' ),
  require( './event/front' )( '' ),
  require( './event/actions.front' )( '' ),
  require( './auth/comexposium.front' )( '' ),
  require( './auth/facebook.front' )( '' ),
  require( './auth/twitter.front' )( '' ),
  require( './auth/google.front' )( '' ),
  require( './auth/local.front' )( '' ),
  require( './auth/reset.front' )( '/password' ),
  require( './agenda/stakeholders.back' )( '/:slug/admin' ),
  require( './agenda/emailstrategie.back' )( '/:slug/admin/emailstrategie' ),
  require( './agenda/embeds.back' )( '/:slug/admin/embeds' ),
  require( './location/front' )( '/locations' ),
  require( './location/back' )( '' ),
  require( './agenda/settings.back' )( '' ),
  require( './agenda/sources.back' )( '/:slug/admin' ),
  require( './agenda/members.back' )( '/:slug/admin/members' ),
  require( './agenda/activities.back' )( '/:slug/admin/activities' ),
  require( './agenda/shares.front' )( '' ),
  require( './agenda/front' )( '' ),
  require( './agenda/exports.back' )( '/agendas/:uid/admin' ),
  require( './agenda/groupActions.back' )( '/agendas/:uid/admin' ),
  require( './agenda/facebook.back' )( '' ),
  require( './agenda/customized.back' )( '' ),
  require( './agenda/actions.front' )( '/:slug/actions' ),
  require( './agenda/exports.front' )( '/agendas/:uid' ),
  require( './activities/notifications.back' )( '/notifications' )
];

module.exports = app => {

  require( './event/search.front' )( app, '/events/search' );
  require( './agenda/back' )( app );
  require( './inboxes/back' )( app );
  require( './inboxes/front' )( app );
  require( './services/surveys' )( app, '' );
  require( './services/agendaContribute' )( app, '' );
  require( './services/users' )( app, '/users' );
  require( './services/abilities' )( app, '/abilities' );

  require( './event/files' )( app, '/' );

  require( './services/agendaDocx' )( app, '/docx' );

  require( './api' );

  // /:agendaSlug/calendar
  require( './services/agendaCalendar' )( app, '' );

  webModules.forEach( m => m.load( app ) );

};

module.exports.webModules = webModules;

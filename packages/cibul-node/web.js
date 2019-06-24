"use strict";

const webModules = [
  require( './event/actions.front' )( '' ),
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

  require( './event/search.front' )( app );
  require( './agenda/back' )( app );
  require( './inboxes/endpoints' )( app );
  require( './inboxes/pages' )( app );
  require( './services/portals' )( app );
  require( './services/surveys' )( app );
  require( './services/agendaContribute' )( app );
  require( './services/agendaSchema' )( app );
  require( './services/members' )( app );
  require( './services/networkApps' )( app );
  require( './services/users' )( app );
  require( './services/abilities' )( app );
  require( './services/mails/unsubscription' )( app );
  require( './event/files' )( app );
  require( './services/agendaDocx' )( app );
  require( './services/agendaCalendar' )( app );
  require( './home/back' )( app );
  require( './user/settings.front' )( app );
  require( './general/front' )( app );
  require( './general/session.back' )( app );
  require( './general/back' )( app );
  require( './search/front' )( app );
  require( './event/form.back' )( app );
  require( './event/tagsForm.back' )( app );
  require( './event/back' )( app );
  require( './event/front' )( app );

  webModules.forEach( m => m.load( app ) );

};

module.exports.webModules = webModules;

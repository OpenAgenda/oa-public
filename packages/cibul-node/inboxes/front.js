"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const morgan = require( 'morgan' );
const { promisify } = require( 'util' );
const ReactDOM = require( 'react-dom/server' );

const agendasMw = require( '@openagenda/agendas/middleware' );
const eventsSvc = require( '@openagenda/events' );
const inboxAppsMw = require( '@openagenda/inbox-apps/lib/middleware' );
const labels = require( '@openagenda/labels/inboxes' );
const makeLabelGetter = require( '@openagenda/labels' );
const sessions = require( '@openagenda/sessions' );
const users = require( '@openagenda/users' );

const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const { mw: { loadAdminLayout, load: oldAgendaLoad } } = require( '../services/agenda' );

const app = express();
const getLabel = makeLabelGetter( labels );

module.exports = ( parentApp, path = '/' ) => parentApp.use( path, app );

const preMw = [
  cmn.loadLogger( 'inboxes/front' ),
  sessions.middleware.ifUnlogged( cmn.redirectToSignin ),
  sessions.middleware.load( { detailed: true } ),
  bodyParser.urlencoded( { extended: true } )
];

if ( __DEVELOPMENT__ ) {
  preMw.push( morgan( 'dev' ) );
}

app.use( '/home/inbox',
  preMw,
  cmn.loadBaseData( 'oasfmain.css' ),
  ( req, res, next ) => {

    users.refresh( 'lastInboxCheck', { uid: req.user.uid }, ( err, success ) => {

      next();

    } );

  },
  ( req, res, next ) => {
    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'user',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            emptyInboxLabel: getLabel( 'homeInboxDesc', req.lang )
          },
          res: {
            author: '/home/inbox/author.json',
            conversations: {
              create: '/home/inbox/conversations.json',
              list: '/home/inbox/conversations.json',
              action: '/home/inbox/conversations/:conversationId/action/:code.json',
              resume: '/home/inbox/conversations/:conversationId/resume.json'
            },
            messages: {
              list: '/home/inbox/conversations/:conversationId/messages.json',
              create: '/home/inbox/conversations/:conversationId/messages.json'
            }
          }
        }
      },
      req.baseUrl,
      getApp( 'inboxes/user' )
    )( req, res, next );
  }
);

app.use( '/:slug/admin/inbox',
  preMw,
  oldAgendaLoad( 'slug' ),
  cmn.checkAdminOrModerator,
  loadAdminLayout,
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  ( req, res, next ) => {
    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'agenda',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            emptyInboxLabel: getLabel( 'agendaInboxDesc', req.lang )
          },
          res: {
            author: '/agendas/:agendaUid/inbox/author.json',
            conversations: {
              create: '/agendas/:agendaUid/inbox/conversations.json',
              list: '/agendas/:agendaUid/inbox/conversations.json',
              action: '/agendas/:agendaUid/inbox/conversations/:conversationId/action/:code.json',
              resume: '/agendas/:agendaUid/inbox/conversations/:conversationId/resume.json'
            },
            messages: {
              list: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json',
              create: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json'
            }
          },
          agenda: req.agenda
        }
      },
      req.baseUrl,
      getApp( 'agendaAdmin/inbox' )
    )( req, res, next );
  }
);

app.use( '/:slug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  wrap( async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'agenda',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // show creation button
            // maskCreationSubtitle: true,
            creationSubtitle: getLabel( 'contactForm', req.lang ),
            topListForm: true, // add a conversation form on top of conversation list
            creationDesc: getLabel( 'sendMessageToAdmin', req.lang ),
            belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
            onConversationCreateRedirect: req.genUrl( 'agendaShow', { slug: req.agenda.slug } ),
            onConversationCreateFlash: getLabel( 'agendaContactCreationSuccess', req.lang ),
            defaultQuery: {
              type: 'contact_form',
              typeIdentifier: req.agenda.uid,
              params: {
                agendaTitle: req.agenda.title
              },
              destinationInbox: {
                type: 'agenda',
                identifier: req.agenda.uid
              }
            }
          },
          res: {
            author: '/home/inbox/author.json',
            conversations: {
              create: '/home/inbox/conversations.json',
              list: '/home/inbox/conversations.json',
              action: '/home/inbox/conversations/:conversationId/action/:code.json',
              resume: '/home/inbox/conversations/:conversationId/resume.json'
            },
            messages: {
              list: '/home/inbox/conversations/:conversationId/messages.json',
              create: '/home/inbox/conversations/:conversationId/messages.json'
            }
          },
          agenda: req.agenda
        }
      },
      req.baseUrl,
      ( req, res, next, { store, component } = {} ) => {

        const state = store ? store.getState() : {};
        const lang = req.lang;

        const content = component ? ReactDOM.renderToString( component ) : '';

        const baseData = {
          event: {
            backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
          },
          image: req.agenda.image,
          title: req.agenda.title
        };

        cmn.render( req, res, 'agenda/inbox', { ...baseData, scriptParams: { state }, lang, content } );

      }
    )( req, res, next );
  } )
);

app.use( '/:slug/admin/events/:eventSlug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  eventLoad(),
  wrap( async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( !adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreNotAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'publicEventContact', {
        slug: req.agenda.slug,
        eventSlug: req.event.slug
      } ) );
    }

    const eventShowLink = req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } );

    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'agenda',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // show creation button
            creationSubtitle: getLabel(
              'contactContributorOf',
              { title: _.escape( getMultiLanguageTitle( req.event, req.lang ) ), link: eventShowLink },
              req.lang
            ),
            maskCreationSubtitle: false,
            topListForm: false, // add a conversation form on top of conversation list
            belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
            onConversationCreateRedirect: eventShowLink,
            onConversationCreateFlash: getLabel( 'agendaContactCreationSuccess', req.lang ),
            defaultQuery: {
              type: 'event',
              typeIdentifier: req.event.uid,
              params: {
                agendaTitle: _.unescape( req.agenda.title ),
                eventTitle: _.unescape( getMultiLanguageTitle( req.event, req.lang ) ),
                agendaUid: req.agenda.uid
              },
              destinationInbox: {
                type: 'user',
                identifier: req.event.ownerUid
              }
            }
          },
          res: {
            author: `/agendas/${req.agenda.uid}/inbox/author.json`,
            conversations: {
              create: `/agendas/${req.agenda.uid}/inbox/conversations.json`,
              list: `/agendas/${req.agenda.uid}/inbox/conversations.json`,
              action: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/action/:code.json`,
              resume: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/resume.json`
            },
            messages: {
              list: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/messages.json`,
              create: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/messages.json`
            }
          },
          agenda: req.agenda,
          event: req.event
        }
      },
      req.baseUrl,
      ( req, res, next, { store, component } = {} ) => {

        const state = store ? store.getState() : {};
        const lang = req.lang;

        const content = component ? ReactDOM.renderToString( component ) : '';

        const baseData = {
          event: {
            ...req.event,
            backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
          },
          image: req.agenda.image,
          title: req.agenda.title
        };

        cmn.render( req, res, 'event/inbox', { ...baseData, scriptParams: { state }, lang, content } );

      }
    )( req, res, next );
  } )
);

app.use( '/:slug/events/:eventSlug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  eventLoad(),
  wrap( async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'adminEventContact', {
        slug: req.agenda.slug,
        eventSlug: req.event.slug
      } ) );
    }

    const eventShowLink = req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } );

    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'agenda',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // show creation button
            creationSubtitle: getLabel(
              'contactAdministratorsOf',
              { title: _.escape( getMultiLanguageTitle( req.agenda, req.lang ) ), link: eventShowLink },
              req.lang
            ),
            maskCreationSubtitle: false,
            topListForm: false, // add a conversation form on top of conversation list
            belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
            onConversationCreateRedirect: eventShowLink,
            onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
            defaultQuery: {
              type: 'event',
              typeIdentifier: req.event.uid,
              params: {
                agendaTitle: _.unescape( req.agenda.title ),
                eventTitle: _.unescape( getMultiLanguageTitle( req.event, req.lang ) ),
                agendaUid: req.agenda.uid
              },
              destinationInbox: {
                type: 'agenda',
                identifier: req.agenda.uid
              }
            }
          },
          res: {
            author: `/home/inbox/author.json`,
            conversations: {
              create: `/home/inbox/conversations.json`,
              list: `/home/inbox/conversations.json`,
              action: `/home/inbox/conversations/:conversationId/action/:code.json`,
              resume: `/home/inbox/conversations/:conversationId/resume.json`
            },
            messages: {
              list: `/home/inbox/conversations/:conversationId/messages.json`,
              create: `/home/inbox/conversations/:conversationId/messages.json`
            }
          },
          agenda: req.agenda,
          event: req.event
        }
      },
      req.baseUrl,
      ( req, res, next, { store, component } = {} ) => {

        const state = store ? store.getState() : {};
        const lang = req.lang;

        const content = component ? ReactDOM.renderToString( component ) : '';

        const baseData = {
          event: {
            ...req.event,
            backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
          },
          image: req.agenda.image,
          title: req.agenda.title
        };

        cmn.render( req, res, 'event/inbox', { ...baseData, scriptParams: { state }, lang, content } );

      }
    )( req, res, next );
  } )
);

app.use( '/:slug/admin/events/:eventSlug/edition-request',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  eventLoad(),
  wrap( async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( !adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreNotAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaEventShow', {
        slug: req.agenda.slug,
        eventSlug: req.event.slug
      } ) );
    }

    const eventShowLink = req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } );

    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'agenda',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // show creation button
            creationSubtitle: getLabel(
              'requestEditionCreationTitle',
              { title: _.escape( getMultiLanguageTitle( req.event, req.lang ) ), link: eventShowLink },
              req.lang
            ),
            maskCreationSubtitle: false,
            topListForm: false, // add a conversation form on top of conversation list
            belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
            onConversationCreateRedirect: eventShowLink,
            onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
            defaultQuery: {
              type: 'edition_request',
              typeIdentifier: req.event.uid,
              params: {
                agendaTitle: _.unescape( req.agenda.title ),
                eventTitle: _.unescape( getMultiLanguageTitle( req.event, req.lang ) ),
                agendaUid: req.agenda.uid
              },
              destinationInbox: {
                type: 'user',
                identifier: req.event.ownerUid
              }
            }
          },
          res: {
            author: `/agendas/${req.agenda.uid}/inbox/author.json`,
            conversations: {
              create: `/agendas/${req.agenda.uid}/inbox/conversations.json`,
              list: `/agendas/${req.agenda.uid}/inbox/conversations.json`,
              action: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/action/:code.json`,
              resume: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/resume.json`
            },
            messages: {
              list: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/messages.json`,
              create: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/messages.json`
            }
          },
          agenda: req.agenda,
          event: req.event
        }
      },
      req.baseUrl,
      ( req, res, next, { store, component } = {} ) => {

        const state = store ? store.getState() : {};
        const lang = req.lang;

        const content = component ? ReactDOM.renderToString( component ) : '';

        const baseData = {
          event: {
            ...req.event,
            backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
          },
          image: req.agenda.image,
          title: req.agenda.title
        };

        cmn.render( req, res, 'event/inbox', { ...baseData, scriptParams: { state }, lang, content } );

      }
    )( req, res, next );
  } )
);

app.use( '/:slug/request-contribute',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  wrap( async ( req, res, next ) => {
    const isContributor = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isContributor )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( isContributor ) {
      sessions.setFlash( req, res, getLabel( 'youreAlreadyContributor', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    inboxAppsMw.matchApp(
      {
        state: {
          user: req.user,
          settings: {
            context: 'agenda',
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // show creation button
            // maskCreationSubtitle: true,
            creationSubtitle: getLabel( 'titleContributionRequest', req.lang ),
            // creationDescriptionLabel: getLabel( 'wantContributeMakeRequest', req.lang ),
            creationButtonLabel: getLabel( 'createConversation', req.lang ),
            // topListForm: true, // add a conversation form on top of conversation list
            creationDesc: getLabel( 'youWantToContribute', req.lang ),
            belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
            onConversationCreateRedirect: req.genUrl( 'agendaShow', { slug: req.agenda.slug } ),
            onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
            defaultQuery: {
              type: 'request_contribute',
              typeIdentifier: req.agenda.uid,
              params: {
                agendaTitle: req.agenda.title,
                agendaUid: req.agenda.uid
              },
              destinationInbox: {
                type: 'agenda',
                identifier: req.agenda.uid
              }
            }
          },
          res: {
            author: '/home/inbox/author.json',
            conversations: {
              create: '/home/inbox/conversations.json',
              list: '/home/inbox/conversations.json',
              action: '/home/inbox/conversations/:conversationId/action/:code.json',
              resume: '/home/inbox/conversations/:conversationId/resume.json'
            },
            messages: {
              list: '/home/inbox/conversations/:conversationId/messages.json',
              create: '/home/inbox/conversations/:conversationId/messages.json'
            }
          },
          agenda: req.agenda
        }
      },
      req.baseUrl,
      ( req, res, next, { store, component } = {} ) => {

        const state = store ? store.getState() : {};
        const lang = req.lang;

        const content = component ? ReactDOM.renderToString( component ) : '';

        const baseData = {
          event: {
            backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
          },
          image: req.agenda.image,
          title: req.agenda.title
        };

        cmn.render( req, res, 'agenda/requestContribute', { ...baseData, scriptParams: { state }, lang, content } );

      }
    )( req, res, next );
  } )
);

function getApp( template ) {

  return ( req, res, next, { store, component } = {} ) => {

    const state = store ? store.getState() : {};
    const lang = req.lang;

    const content = component ? ReactDOM.renderToString( component ) : '';

    cmn.render( req, res, template, { scriptParams: { state }, lang, content } );

  };

}

function eventLoad() {
  return wrap( async ( req, res, next ) => {
    req.event = await promisify( eventsSvc.get )(
      { slug: req.params.eventSlug },
      { internal: true, includeImagePath: true, private: null }
    );

    next();
  } );
}

function getMultiLanguageTitle( entity, lang ) {
  if ( typeof entity.title === 'string' ) {
    return entity.title;
  }

  const keys = Object.keys( entity.title );
  return entity.title[ lang ] || entity.title[ keys[ 0 ] ];
}

/* Util */

function wrap( fn ) {
  return ( req, res, next ) => fn( req, res, next ).catch( next );
}

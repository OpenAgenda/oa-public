"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const { promisify } = require( 'util' );
const ReactDOM = require( 'react-dom/server' );

const eventsSvc = require( '@openagenda/events' );
const agendasMw = require( '@openagenda/agendas/middleware' );
const stakeholderMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );
const createInboxApp = require( '@openagenda/inbox-apps/dist/apps/inbox' );
const locationSvc = require( '@openagenda/agenda-locations' );
const labels = require( '@openagenda/labels/inboxes' );
const makeLabelGetter = require( '@openagenda/labels' );
const sessions = require( '@openagenda/sessions' );
const users = require( '@openagenda/users' );

const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const { mw: { loadAdminLayout, load: oldAgendaLoad } } = require( '../services/agenda' );
const members = require( '../services/members' );

const app = express();
const getLabel = makeLabelGetter( labels );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'inbox' }
);

module.exports = ( parentApp, path = '/' ) => parentApp.use( path, app );

const preMw = [
  cmn.loadLogger( 'inboxes/front' ),
  sessions.middleware.ifUnlogged( cmn.redirectToSignin )
];

app.use(
  '/home/inbox',
  preMw,
  cmn.loadBaseData( 'oasfmain.css' ),
  ( req, res, next ) => {
    users.refresh( {
      lastInboxCheck: true
    }, {
      query: { uid: req.user.uid }
    } )
      .then( () => next() );
  },
  async ( req, res, next ) => {
    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
        user: req.user,
        settings: {
          context: 'user',
          prefix: req.baseUrl,
          lang: req.lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20,
          emptyInboxLabel: getLabel( 'homeInboxDesc', req.lang ),
          displayHelp: true,
          autoFocus: true
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
            create: '/home/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
          }
        }
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      cmn.render( req, res, 'inboxes/user', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/support',
  preMw,
  cmn.loadBaseData( 'oasfmain.css' ),
  async ( req, res, next ) => {
    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
        user: req.user,
        settings: {
          context: 'user',
          prefix: req.baseUrl,
          lang: req.lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20,
          creationDesc: getLabel( 'supportInboxDesc', req.lang ),
          // displayHelp: true,
          hideEmptyList: true, // redirect on creation if the list is empty
          allowCreateConversation: true, // show creation button
          topListForm: true,
          defaultQuery: {
            type: 'support',
            destinationInbox: {
              type: 'support',
              identifier: 1
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
            create: '/home/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
          }
        }
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      cmn.render( req, res, 'inboxes/user', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/admin/inbox',
  preMw,
  oldAgendaLoad( 'slug' ),
  cmn.authorize.moderator,
  cmn.loadAgenda,
  async ( req, res, next ) => {
    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
        user: req.user,
        settings: {
          context: 'agenda',
          prefix: req.baseUrl,
          lang: req.lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20,
          emptyInboxLabel: getLabel( 'agendaInboxDesc', req.lang ),
          displayHelp: true
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
            create: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: '/agendas/:agendaUid/inbox/conversations/:conversationId/add-attachment'
          }
        },
        agenda: req.agenda
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      return res.send( layout(
        `<div class="inbox inbox-agenda-admin">
          <div class="js_canvas">${content}</div>
        </div>`, {
        lang: req.lang,
        role: req.role,
        agenda: req.agenda,
        bodyAttributes: [ {
          name: 'data-options',
          value: JSON.stringify( { initialState: state } )
        } ],
        scripts: {
          bottom: [ { src: '/js/agendaAdminInbox.js' } ]
        }
      } ) );

    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
          onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
          defaultQuery: {
            type: 'contact_form',
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
            create: '/home/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
          }
        },
        agenda: req.agenda
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'agenda/inbox', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/admin/members/:stakeholderId/contact',
  ( req, res, next ) => {
    req.shIdentifiers = { id: req.params.stakeholderId };
    next();
  },
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  stakeholderMw.agenda( 'agendaInstance' ).get( { // from
    namespaces: { stakeholder: 'userSh' }
  } ),
  stakeholderMw.agenda( 'agendaInstance' ).get( { // to
    namespaces: { identifiers: 'shIdentifiers' },
    options: { detailed: true }
  } ),
  async ( req, res, next ) => {
    if ( !req.stakeholder || !req.stakeholder.id ) {
      sessions.setFlash( req, res, getLabel( 'youCannotWriteToThisMember', req.lang ) );
      return res.redirect( 302, `/${req.agenda.slug}/admin` );
    }

    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( !adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreNotAdminOrModerator', req.lang ) );
      return res.redirect( 302, `/${req.agenda.slug}/admin` );
    }

    const shIsAdminmod = [ 2, 3 ].includes( req.stakeholder.credential );

    const destinationInbox = shIsAdminmod ? {
      type: 'user',
      identifier: req.stakeholder.user.uid
    } : [];

    const userName = req.stakeholder.custom.contactName || req.stakeholder.user.fullName;

    const resPrefix = shIsAdminmod ? '/home' : `/agendas/${req.agenda.uid}`;

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
          // topListForm: true, // add a conversation form on top of conversation list
          creationSubtitle: getLabel( 'contactName', { name: userName }, req.lang ),
          // creationDesc: getLabel( 'sendMessageToName', { name: req.stakeholder.user.fullName }, req.lang ),
          belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
          onConversationCreateRedirect: `/agendas/${req.agenda.uid}/admin/members`,
          onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
          defaultQuery: {
            type: 'contact_member',
            typeIdentifier: req.stakeholder.id,
            params: {
              agendaTitle: req.agenda.title,
              agendaUid: req.agenda.uid,
              userUid: req.stakeholder.user.uid,
              userName
            },
            destinationInbox
          }
        },
        res: {
          author: `${resPrefix}/inbox/author.json`,
          conversations: {
            create: `${resPrefix}/inbox/conversations.json`,
            list: `${resPrefix}/inbox/conversations.json`,
            action: `${resPrefix}/inbox/conversations/:conversationId/action/:code.json`,
            resume: `${resPrefix}/inbox/conversations/:conversationId/resume.json`
          },
          messages: {
            list: `${resPrefix}/inbox/conversations/:conversationId/messages.json`,
            create: `${resPrefix}/inbox/conversations/:conversationId/messages.json`,
            prepareAttachment: `${resPrefix}/inbox/conversations/:conversationId/prepare-attachment`,
            addAttachment: `${resPrefix}/inbox/conversations/:conversationId/add-attachment`
          }
        },
        agenda: req.agenda
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'agenda/inbox', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/admin/events/:eventSlug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  eventLoad(),
  async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( !adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreNotAdminOrModerator', req.lang ) );
      return res.redirect( 302, `/${req.agenda.slug}/events/${req.event.slug}/contact` );
    }

    const eventShowLink = req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } );

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
          onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
          defaultQuery: {
            type: 'event',
            typeIdentifier: req.event.uid,
            params: {
              agendaTitle: _.unescape( req.agenda.title ),
              agendaUid: req.agenda.uid,
              eventTitle: _.unescape( getMultiLanguageTitle( req.event, req.lang ) )
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
            create: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/messages.json`,
            prepareAttachment: `agendas/${req.agenda.uid}/inbox/conversations/:conversationId/prepare-attachment`,
            addAttachment: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/add-attachment`
          }
        },
        agenda: req.agenda,
        event: req.event
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          ...req.event,
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'event/inbox', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/events/:eventSlug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  eventLoad(),
  async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, `/${req.agenda.slug}/admin/events/${req.event.slug}/contact` );
    }

    const eventShowLink = req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } );

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
              agendaUid: req.agenda.uid,
              eventTitle: _.unescape( getMultiLanguageTitle( req.event, req.lang ) )
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
            create: `/home/inbox/conversations/:conversationId/messages.json`,
            prepareAttachment: `/home/inbox/conversations/:conversationId/prepare-attachment`,
            addAttachment: `/home/inbox/conversations/:conversationId/add-attachment`
          }
        },
        agenda: req.agenda,
        event: req.event
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          ...req.event,
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'event/inbox', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/admin/events/:eventSlug/edition-request',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  eventLoad(),
  async ( req, res, next ) => {
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

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
              agendaUid: req.agenda.uid,
              eventTitle: _.unescape( getMultiLanguageTitle( req.event, req.lang ) )
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
            create: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/messages.json`,
            prepareAttachment: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/prepare-attachment`,
            addAttachment: `/agendas/${req.agenda.uid}/inbox/conversations/:conversationId/add-attachment`
          }
        },
        agenda: req.agenda,
        event: req.event
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          ...req.event,
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'event/inbox', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/request-contribute',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  async ( req, res, next ) => {

    if ( await members.get( { agendaUid: req.agenda.uid, userUid: req.user.uid } ) ) {
      sessions.setFlash( req, res, getLabel( 'youreAlreadyContributor', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
            create: '/home/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: `/home/inbox/conversations/:conversationId/prepare-attachment`,
            addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
          }
        },
        agenda: req.agenda
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'agenda/requestContribute', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/locations/:locationUid/suggest-change',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null,
    internal: true
  } ),
  locationSvc.mw( 'agenda.id' ).load,
  async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } ),
    ] )).some( Boolean );

    if ( adminOrModerator ) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, context } = createInboxApp( {
      req,
      initialState: {
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
          creationSubtitle: getLabel( 'titleSuggestLocationChange', req.lang ),
          // creationDescriptionLabel: getLabel( 'wantContributeMakeRequest', req.lang ),
          creationButtonLabel: getLabel( 'createConversation', req.lang ),
          // topListForm: true, // add a conversation form on top of conversation list
          creationDesc: getLabel( 'suggestLocationChangeDesc', req.lang ),
          belowMessageDesc: getLabel( 'retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang ),
          onConversationCreateRedirect: req.genUrl( 'agendaShow', { slug: req.agenda.slug } ),
          onConversationCreateFlash: getLabel( 'conversationCreationSuccess', req.lang ),
          defaultQuery: {
            type: 'suggest_location_change',
            typeIdentifier: req.location.uid,
            params: {
              agendaTitle: req.agenda.title,
              agendaUid: req.agenda.uid,
              locationName: req.location.name,
              locationUid: req.location.uid
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
            create: '/home/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
          }
        },
        agenda: req.agenda
      }
    } );

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( element );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( context.status === 404 ) {
        return next();
      }

      if ( context.url ) {
        return res.redirect( 301, context.url );
      }

      const { pathname, search } = state.router.location;
      if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
        return res.redirect( 301, pathname );
      }

      const baseData = {
        event: {
          backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
        },
        image: req.agenda.image,
        title: req.agenda.title
      };

      cmn.render( req, res, 'agenda/inbox', {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      } );
    } catch ( e ) {
      next( e );
    }
  }
);

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

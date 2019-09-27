"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const { promisify } = require( 'util' );
const ReactDOM = require( 'react-dom/server' );
const { parsePath } = require('history');
const eventsSvc = require( '@openagenda/events' );
const createInboxApp = require( '@openagenda/inbox-apps/dist/apps/inbox' );
const wrapApp = require( '@openagenda/react-utils/dist/wrapApp' );
const locationSvc = require( '@openagenda/agenda-locations' );
const labels = require( '@openagenda/labels/inboxes' );
const makeLabelGetter = require( '@openagenda/labels' );

const cmn = require( '../lib/commons-app' );
const config = require( '../config' );

const members = require( '../services/members' );
const sessions = require( '../services/sessions' );
const usersSvc = require( '../services/users' );

const app = express();
const getLabel = makeLabelGetter( labels );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'inbox' }
);

module.exports = ( parentApp, path = '/' ) => parentApp.use( path, app );

app.use(
  '/home/inbox',
  sessions.mw.loadOrRedirect,
  cmn.loadBaseData('oasfmain.css'),
  ( req, res, next ) => {
    usersSvc.refresh( req.user.uid, {
      lastInboxCheck: true
    } ).then( () => next() ).catch( next );
  },
  async ( req, res, next ) => {
    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
      }

      cmn.render( req, res, 'inboxes/user', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/support',
  sessions.mw.loadOrRedirect,
  cmn.loadBaseData( 'oasfmain.css' ),
  async ( req, res, next ) => {
    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
      }

      cmn.render( req, res, 'inboxes/user', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
    } catch ( e ) {
      next( e );
    }
  }
);

app.use(
  '/:slug/admin/inbox',
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.loadAndAuthorize('moderator'),
  async ( req, res, next ) => {
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
      }

      return res.send( layout(
        `<div class="inbox inbox-agenda-admin">
          <div class="js_canvas">${content}</div>
        </div>`, {
        lang: req.lang,
        role: req.member.role,
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
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.load,
  cmn.loadBaseData( 'oasfmain.css' ),
  async ( req, res, next ) => {
    if (req.member && members.utils.compareRoles.isSuperiorToOrEqual(req.member.role, 'moderator')) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
      }

      const baseData = {
        event: {
          backLink: `/${req.agenda.slug}`
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
  '/:slug/admin/members/:memberId/contact',
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.loadTarget.options({detailed: true}),
  members.mw.loadAndAuthorize('moderator'),
  cmn.loadBaseData( 'oasfmain.css' ),
  async ( req, res, next ) => {
    const targetIsAdminMod = members.utils.compareRoles.isSuperiorToOrEqual(
      req.targetMember.role,
      'moderator'
    );

    const destinationInbox = targetIsAdminMod ? {
      type: 'user',
      identifier: req.targetMember.user.uid
    } : [];

    const userName = _.get( req.targetMember, 'custom.contactName',
      req.targetMember.user.fullName
    );

    const resPrefix = targetIsAdminMod ? '/home' : `/agendas/${req.agenda.uid}`;

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
            typeIdentifier: req.targetMember.id,
            params: {
              agendaTitle: req.agenda.title,
              agendaUid: req.agenda.uid,
              userUid: req.targetMember.user.uid,
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
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
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  cmn.loadBaseData( 'oasfmain.css' ),
  members.mw.loadAndAuthorize('moderator'),
  eventLoad(),
  async ( req, res, next ) => {

    const eventShowLink = `/${req.agenda.slug}/events/${req.event.slug}`;

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
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
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.load,
  cmn.loadBaseData( 'oasfmain.css' ),
  eventLoad(),
  async ( req, res, next ) => {
    if (req.member && members.utils.compareRoles.isSuperiorToOrEqual(req.member.role, 'moderator')) {
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, `/${req.agenda.slug}/admin/events/${req.event.slug}/contact` );
    }

    const eventShowLink = `/${req.agenda.slug}/events/${req.event.slug}`;

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
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
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.loadAndAuthorize('moderator'),
  cmn.loadBaseData('oasfmain.css'),
  eventLoad(),
  async ( req, res, next ) => {
    const eventShowLink = `/${req.agenda.slug}/events/${req.event.slug}`;

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    });
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
      }

      const baseData = {
        event: {
          ...req.event,
          backLink: `/${req.agenda.slug}`
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
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.load,
  cmn.loadBaseData('oasfmain.css'),
  async ( req, res, next ) => {

    if (req.member) {
      sessions.setFlash(req, res, getLabel('youreAlreadyContributor', req.lang));
      return res.redirect(302, `/${req.agenda.slug}`);
    }

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
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
  sessions.mw.loadOrRedirect,
  cmn.loadAgenda,
  members.mw.load,
  cmn.loadBaseData( 'oasfmain.css' ),
  locationSvc.mw('agenda.id').load,
  async ( req, res, next ) => {
    const agendaLink = `/${req.agenda.slug}`;

    if (req.member && members.utils.compareRoles.isSuperiorToOrEqual(req.member.role, 'moderator')) {
      sessions.setFlash(req, res, getLabel('youreAdminOrModerator', req.lang));
      return res.redirect(302, agendaLink);
    }

    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp( {
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
          onConversationCreateRedirect: agendaLink,
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
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString( wrapApp( reactApp ) );

      const state = store.getState();

      // Remove apiRoot used only on server side
      state.settings.apiRoot = '';

      if ( staticContext.status === 404 ) {
        return next();
      }

      if ( staticContext.url ) {
        return res.redirect( 302, staticContext.url );
      }

      const { pathname } = history.location;
      if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
        return res.redirect( 302, pathname );
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

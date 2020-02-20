'use strict';

const _ = require('lodash');
const createInboxApp = require('@openagenda/inbox-apps/dist/apps/inbox');
const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);
const ReactDOM = require('react-dom/server');
const wrapApp = require('@openagenda/react-utils/dist/wrapApp');
const { parsePath } = require('history');


const cmn = require('../../../../lib/commons-app');
const { getMultiLanguageTitle } = require('./utils');

module.exports = async ({ config, services }, req, res, next) => {
  const eventShowLink = `/${req.agenda.slug}/events/${req.event.slug}`;

  const lang = req.lang || 'fr';
  const staticContext = {};
  const reactApp = createInboxApp({
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
          { title: _.escape(getMultiLanguageTitle(req.event, req.lang)), link: eventShowLink },
          req.lang
        ),
        maskCreationSubtitle: false,
        topListForm: false, // add a conversation form on top of conversation list
        belowMessageDesc: getLabel('retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang),
        onConversationCreateRedirect: eventShowLink,
        onConversationCreateFlash: getLabel('conversationCreationSuccess', req.lang),
        defaultQuery: {
          type: 'edition_request',
          typeIdentifier: req.event.uid,
          params: {
            agendaTitle: _.unescape(req.agenda.title),
            agendaUid: req.agenda.uid,
            eventTitle: _.unescape(getMultiLanguageTitle(req.event, req.lang))
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

    const content = ReactDOM.renderToString(wrapApp(reactApp, { req, staticContext }));

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

    cmn.render(req, res, 'event/inbox', {
      ...baseData,
      scriptParams: { initialState: state },
      lang,
      content,
      preloaded: true
    });
  } catch (e) {
    next(e);
  }
}

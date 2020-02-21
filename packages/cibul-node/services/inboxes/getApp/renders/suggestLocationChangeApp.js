'use strict';

const createInboxApp = require('@openagenda/inbox-apps/dist/apps/inbox');
const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);
const ReactDOM = require('react-dom/server');
const wrapApp = require('@openagenda/react-utils/dist/wrapApp');

const cmn = require('../../../../lib/commons-app');

const {
  getMultiLanguageTitle
} = require('./utils');

module.exports = async ({ services, config }, req, res, next) => {
  const {
    sessions,
  } = services;

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

    const content = ReactDOM.renderToString( wrapApp( reactApp, { req, staticContext } ) );

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
        backLink: agendaLink
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

'use strict';

const { parsePath } = require('history');
const createInboxApp = require('@openagenda/inbox-apps/dist/apps/inbox');
const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);
const ReactDOM = require('react-dom/server');
const { wrapApp } = require('@openagenda/react-shared');

const cmn = require('../../../../lib/commons-app');

module.exports = async ({ services, config }, req, res, next) => {
  const {
    members
  } = services;

  const targetIsAdminMod = members.utils.compareRoles.isSuperiorToOrEqual(
    req.targetMember.role,
    'moderator'
  );

  const userName = _.get(req.targetMember, 'custom.contactName',
    req.targetMember.user.fullName
  );

  const resPrefix = targetIsAdminMod ? '/home' : `/agendas/${req.agenda.uid}`;

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
          destinationInbox: targetIsAdminMod ? {
            type: 'user',
            identifier: req.targetMember.user.uid
          } : []
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
  });

  const { triggerHooks, store, history } = reactApp;

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString(wrapApp(reactApp, { req, staticContext }));

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if (staticContext.status === 404) {
      return next();
    }

    if (staticContext.url) {
      return res.redirect(302, staticContext.url);
    }

    const { pathname } = history.location;
    if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
      return res.redirect(302, pathname);
    }

    const baseData = {
      event: {
        backLink: `/${req.agenda.slug}`
      },
      image: req.agenda.image,
      title: req.agenda.title
    };

    cmn.render(req, res, 'agenda/inbox', {
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

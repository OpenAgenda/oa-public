import ReactDOM from 'react-dom/server';
import { parsePath } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createInboxApp from '@openagenda/inbox-apps';
import cmn from '../../../lib/commons-app.js';

function endpointToRes(endpoint) {
  return {
    author: `${endpoint}/author.json`,
    conversations: {
      create: `${endpoint}/conversations.json`,
      list: `${endpoint}/conversations.json`,
      action: `${endpoint}/conversations/:conversationId/action/:code.json`,
      resume: `${endpoint}/conversations/:conversationId/resume.json`,
    },
    messages: {
      list: `${endpoint}/conversations/:conversationId/messages.json`,
      create: `${endpoint}/conversations/:conversationId/messages.json`,
      prepareAttachment: `${endpoint}/conversations/:conversationId/prepare-attachment`,
      uploadAttachment: `${endpoint}/conversations/:conversationId/upload-attachment`,
      addAttachment: `${endpoint}/conversations/:conversationId/add-attachment`,
    },
  };
}

export default function render({ template, baseData, endpoint, initialState }) {
  return async (req, res, next) => {
    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp({
      req,
      initialState: {
        res: endpointToRes(endpoint),
        ...initialState,
      },
    });
    const { triggerHooks, store, history } = reactApp;

    try {
      await triggerHooks();

      const content = ReactDOM.renderToString(
        wrapApp(reactApp, { req, staticContext, extraProps: { lang } }),
      );

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
      if (
        decodeURIComponent(parsePath(req.originalUrl).pathname)
        !== decodeURIComponent(pathname)
      ) {
        return res.redirect(302, pathname);
      }

      cmn.render(req, res, template, {
        ...baseData,
        scriptParams: {
          initialState: state,
          extraProps: {
            lang,
          },
        },
        lang,
        content,
        preloaded: true,
      });
    } catch (e) {
      next(e);
    }
  };
}

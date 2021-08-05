const ReactDOM = require('react-dom/server');
const { parsePath } = require('history');
const { wrapApp } = require('@openagenda/react-shared');
const createInboxApp = require('@openagenda/inbox-apps/dist/apps/inbox');
const cmn = require('../../../../lib/commons-app');

function endpointToRes(endpoint) {
  return {
    author: `${endpoint}/author.json`,
    conversations: {
      create: `${endpoint}/conversations.json`,
      list: `${endpoint}/conversations.json`,
      action: `${endpoint}/conversations/:conversationId/action/:code.json`,
      resume: `${endpoint}/conversations/:conversationId/resume.json`
    },
    messages: {
      list: `${endpoint}/conversations/:conversationId/messages.json`,
      create: `${endpoint}/conversations/:conversationId/messages.json`,
      prepareAttachment: `${endpoint}/conversations/:conversationId/prepare-attachment`,
      addAttachment: `${endpoint}/conversations/:conversationId/add-attachment`
    }
  };
}

module.exports = function render({ template, baseData, endpoint, initialState }) {
  return async (req, res, next) => {
    const lang = req.lang || 'fr';
    const staticContext = {};
    const reactApp = createInboxApp({
      req,
      initialState: {
        res: endpointToRes(endpoint),
        ...initialState
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

      cmn.render(req, res, template, {
        ...baseData,
        scriptParams: { initialState: state },
        lang,
        content,
        preloaded: true
      });
    } catch (e) {
      next(e);
    }
  };
}

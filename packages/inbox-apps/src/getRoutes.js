import loadableEsm from '@openagenda/react-shared/utils/loadableEsm';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext
      && import.meta.webpackContext('.', {
        recursive: true,
        regExp: /\.js$/,
        mode: 'weak',
      })
  : null;

const App = loadableEsm({
  chunkName: 'inbox-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "inbox-App" */
      './containers/App.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/App.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/App.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/App.js');
    }
  },
});

const Inbox = loadableEsm({
  chunkName: 'inbox-Inbox',
  importAsync: () =>
    import(
      /* webpackChunkName: "inbox-Inbox" */
      './containers/Inbox.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Inbox.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Inbox.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Inbox.js');
    }
  },
});

const Conversation = loadableEsm({
  chunkName: 'inbox-Conversation',
  importAsync: () =>
    import(
      /* webpackChunkName: "inbox-Conversation" */
      './containers/Conversation.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Conversation.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Conversation.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Conversation.js');
    }
  },
});

const ConversationCreate = loadableEsm({
  chunkName: 'inbox-ConversationCreate',
  importAsync: () =>
    import(
      /* webpackChunkName: "inbox-ConversationCreate" */
      './containers/ConversationCreate.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/ConversationCreate.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/ConversationCreate.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/ConversationCreate.js');
    }
  },
});

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      { path: `${prefix}/`, exact: true, component: Inbox },
      { path: `${prefix}/conversation/create`, component: ConversationCreate },
      {
        path: `${prefix}/conversation/:conversationId`,
        component: Conversation,
      },
    ],
  },
];

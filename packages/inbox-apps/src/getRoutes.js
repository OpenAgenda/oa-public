import { loadable } from '@openagenda/react-shared';

const App = loadable(() =>
  import(/* webpackChunkName: "inbox-App" */'./containers/App'));
const Inbox = loadable(() =>
  import(/* webpackChunkName: "inbox-Inbox" */'./containers/Inbox'));
const Conversation = loadable(() =>
  import(/* webpackChunkName: "inbox-Conversation" */'./containers/Conversation'));
const ConversationCreate = loadable(() =>
  import(/* webpackChunkName: "inbox-ConversationCreate" */'./containers/ConversationCreate'));

export default (prefix = '') => [{
  path: prefix,
  component: App,
  routes: [
    { path: `${prefix}/`, exact: true, component: Inbox },
    { path: `${prefix}/conversation/create`, component: ConversationCreate },
    { path: `${prefix}/conversation/:conversationId`, component: Conversation },
  ],
}];

import _ from 'lodash';
import cmn from '../lib/commons-app.js';
import { ifUnlogged } from '../lib/authGuards.js';

function _loadUser(detailed, req, res, next) {
  const { services } = req.app;

  services.users
    .findOne({ query: { id: req.user.id }, detailed: true })
    .then((user) => {
      req.user = user;

      next();
    })
    .catch(next);
}

function latestInboxMessageTimestamp(req, res, next) {
  const { Inbox } = req.app.services.inboxes;

  Inbox.user(req.user.uid)
    .conversations.list(0, 1)
    .then(({ data }) => {
      const latestConversation = _.head(data);

      if (!latestConversation) {
        return res.send({ hasNew: false });
      }

      const timestamp = _.get(
        latestConversation,
        'latestMessage.createdAt',
        null,
      );

      if (timestamp === null) {
        return res.send({ hasNew: false });
      }
      if (!req.user.lastInboxCheck) {
        return res.send({ hasNew: true });
      }
      if (timestamp > req.user.lastInboxCheck) {
        return res.send({ hasNew: true });
      }

      res.send({ hasNew: false });
    })
    .catch(next);
}

export default (app) => {
  app.get(
    '/latest-inbox-timestamp',
    cmn.loadLogger('latestInboxMessageTimestamp'),
    ifUnlogged((req, res) => res.send(null)),
    _loadUser.bind(null, true),
    latestInboxMessageTimestamp,
  );
};

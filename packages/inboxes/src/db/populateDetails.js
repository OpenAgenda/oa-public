import _ from 'lodash';

export default async function populateDetails(svc, entities, inbox) {
  const { Inbox } = svc;
  const { interfaces, defaultImagePath } = svc.config;

  if (entities === null) {
    return null;
  }

  if (!Array.isArray(entities)) {
    return (await populateDetails(svc, [entities], inbox))?.[0];
  }

  const result = await Promise.all(
    entities.map(async row => {
      if (row.inboxUserId) {
        delete row.inboxUserId;
      }
      if (row.creatorInboxUserId) {
        delete row.creatorInboxUserId;
      }

      if (row.inboxUser && row.inboxUser.inboxId !== inbox.data.id) {
        // check if the current user is in the entity inbox
        const inboxUser = inbox.data.type === 'user'
          ? await new Inbox(row.inboxUser.inboxId).users.get({
            userUid: inbox.data.identifier
          })
          : null;

        if (!inboxUser || !inboxUser.data) {
          delete row.inboxUser;
        }
      }

      if (
        row.creatorInboxUser
        && row.creatorInboxUser.inboxId !== inbox.data.id
      ) {
        // check if the current user is in the creator inbox of entity
        const creatorInboxUser = inbox.data.type === 'user'
          ? await new Inbox(row.creatorInboxUser.inboxId).users.get({
            userUid: inbox.data.identifier
          })
          : null;

        if (!creatorInboxUser || !creatorInboxUser.data) {
          delete row.creatorInboxUser;
        }
      }

      return row;
    })
  );

  const listsToPopulate = result.reduce(
    (prev, row) => {
      if (row.inboxUser) {
        prev.users.push(row.inboxUser);
      }
      if (row.inbox) {
        prev.inboxes.push(row.inbox);
      }

      if (row.creatorInboxUser) {
        prev.users.push(row.creatorInboxUser);
      }
      if (row.creatorInbox) {
        prev.inboxes.push(row.creatorInbox);
      }

      return prev;
    },
    { users: [], inboxes: [] }
  );

  listsToPopulate.users = _.uniqWith(listsToPopulate.users, _.isEqual);
  listsToPopulate.inboxes = _.uniqWith(listsToPopulate.inboxes, _.isEqual);

  const usersDetails = await interfaces.getUsersDetails(listsToPopulate.users);
  const inboxesDetails = await interfaces.getInboxesDetails(
    listsToPopulate.inboxes
  );

  return result.map(entity => {
    const inboxUserIndex = entity.inboxUser
      ? usersDetails.findIndex(v => entity.inboxUser.userUid === v.uid)
      : -1;
    const inboxIndex = entity.inbox
      ? inboxesDetails.findIndex(v => entity.inbox.identifier === v.uid)
      : -1;

    const creatorInboxUserIndex = entity.creatorInboxUser
      ? usersDetails.findIndex(v => entity.creatorInboxUser.userUid === v.uid)
      : -1;
    const creatorInboxIndex = entity.creatorInbox
      ? inboxesDetails.findIndex(v => entity.creatorInbox.identifier === v.uid)
      : -1;

    if (inboxUserIndex !== -1) {
      Object.assign(entity.inboxUser, usersDetails[inboxUserIndex]);
    } else if (entity.inboxUser) {
      entity.inboxUser.avatar = defaultImagePath;
    }

    if (inboxIndex !== -1) {
      Object.assign(entity.inbox, inboxesDetails[inboxIndex]);
    } else if (entity.inbox) {
      entity.inbox.avatar = defaultImagePath;
    }

    if (creatorInboxUserIndex !== -1) {
      Object.assign(
        entity.creatorInboxUser,
        usersDetails[creatorInboxUserIndex]
      );
    }
    if (creatorInboxIndex !== -1) {
      Object.assign(entity.creatorInbox, inboxesDetails[creatorInboxIndex]);
    }

    return entity;
  });
}

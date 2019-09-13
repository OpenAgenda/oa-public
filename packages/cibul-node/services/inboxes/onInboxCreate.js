'use strict';

const log = require('@openagenda/logs')('services/inboxes');
const membersSvc = require('../members');

module.exports = async function onInboxCreate(Inbox) {

  switch (Inbox.data.type) {
    case 'user': {
      const inboxUser = await Inbox.users.add({ userUid: Inbox.data.identifier });

      if (!inboxUser.data) {
        log('warn', 'Cannot get/create InboxUser (%j) on inbox (%j)', { userUid: Inbox.data.identifier }, Inbox.data);
      }

      break;
    }
    case 'agenda': {
      // get all adminmods
      // create inboxUsers

      const members = [];
      const limit = 100;
      let pos = 0;
      let result;
      const shList = () => membersSvc.list(
        {
          agendaUid: Inbox.data.identifier,
          role: ['administrator', 'moderator'],
          deletedUser: false
        },
        { offset: pos, limit }
      );

      while (result = await shList()) {
        if (!result.length) break;
        pos = pos + limit;

        Array.prototype.push.apply(members, result);
      }

      for (const member of members) {
        await Inbox.users.add({ userUid: member.userUid });
      }

      break;
    }
  }
};

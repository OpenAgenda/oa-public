import logs from '@openagenda/logs';

const log = logs('services/inboxes');

export default async function onInboxCreate(services, inbox) {
  const { members: membersSvc } = services;

  switch (inbox.data.type) {
    case 'user': {
      const inboxUser = await inbox.users.add({
        userUid: inbox.data.identifier,
      });

      if (!inboxUser.data) {
        log(
          'warn',
          'Cannot get/create InboxUser (%j) on inbox (%j)',
          { userUid: inbox.data.identifier },
          inbox.data,
        );
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
      const shList = () =>
        membersSvc.list(
          {
            agendaUid: inbox.data.identifier,
            role: ['administrator', 'moderator'],
            deletedUser: false,
          },
          { offset: pos, limit },
        );

      while ((result = await shList())) {
        if (!result.length) break;
        pos += limit;

        Array.prototype.push.apply(members, result);
      }

      for (const member of members) {
        await inbox.users.add({ userUid: member.userUid });
      }

      break;
    }
    default:
      break;
  }
}

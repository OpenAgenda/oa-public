'use strict';

module.exports = function listAllAdminMods(membersSvc) {
  return agendaUid => new Promise(
    (rs, rj) => {
      const stream = membersSvc.stream({
        agendaUid,
        role: ['administrator', 'moderator'],
        withUser: true,
      }, {}, { detailed: true, userOptions: { detailed: true } });

      const members = [];

      stream.on('data', member => {
        members.push(member);
      });
      stream.on('end', () => {
        rs(members);
      });
      stream.on('error', rj);
    },
  );
};

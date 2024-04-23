'use strict';

module.exports = (services, { agenda, query, data, context }) => services
  .members.list({
    ...query,
    agendaUid: agenda.uid,
    withActions: data.inactive ? false : null,
    deletedUsers: false,
  }, {
    after: context.after ?? 0,
    limit: 1,
  }, {
    detailed: true,
    userOptions: { detailed: true },
  }).then(members => members.shift());

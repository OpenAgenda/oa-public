'use strict';

module.exports = function onRemoveSource(services, {
  aggregatorAgenda,
  sourceAgenda,
  user,
  member,
}) {
  return services.activities.addActivity({
    entityType: 'agenda',
    entityUid: aggregatorAgenda.uid,
  }, {
    actor: `user:${user.uid}`,
    verb: 'agenda.removeSource',
    object: `agenda:${sourceAgenda.uid}`,
    target: `agenda:${aggregatorAgenda.uid}`,
    store: {
      labels: {
        actor: member.custom.contactName || user.name,
        object: sourceAgenda.title,
        target: aggregatorAgenda.title,
      },
    },
  });
};

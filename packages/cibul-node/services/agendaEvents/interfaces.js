'use strict';

const beforeRemove = require('./beforeRemove');
const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const onRemove = require('./onRemove');

module.exports = function interfaces({ services, config }) {
  return {
    onCreate: onCreate.bind(null, { config, services }),
    onUpdate: onUpdate.bind(null, { config, services }),
    onRemove: onRemove.bind(null, { services }),
    beforeRemove: beforeRemove.bind(null, { services }),
    getMembers: (aes = []) => services.members.list({
      agendaUid: aes?.[0]?.agendaUid,
      userUid: aes.map(ae => ae.userUid).filter(userUid => !!userUid),
    }),
    getSourceAgendas: uids => services.agendas
      .list({ uid: uids })
      .then(({ agendas }) => agendas),
  };
};

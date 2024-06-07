import beforeRemove from './beforeRemove.mjs';
import onCreate from './onCreate.mjs';
import onUpdate from './onUpdate.mjs';
import onRemove from './onRemove.mjs';

async function getUsers({ services }, aes) {
  const {
    users,
  } = services;

  const { data } = await users.find({
    query: {
      uid: {
        $in: [].concat(aes).map(ae => ae.userUid).filter(uid => !!uid),
      },
    },
  });

  return data.map(user => ({
    uid: user.uid,
    fullName: user.fullName,
    culture: user.culture,
  }));
}

export default function interfaces({ services, config }) {
  return {
    onCreate: onCreate.bind(null, { config, services }),
    onUpdate: onUpdate.bind(null, { config, services }),
    onRemove: onRemove.bind(null, { services }),
    beforeRemove: beforeRemove.bind(null, { services }),
    getMembers: (aes = []) => services.members.list({
      agendaUid: aes?.[0]?.agendaUid,
      userUid: aes.map(ae => ae.userUid).filter(userUid => !!userUid),
    }),
    getUsers: getUsers.bind(null, { services }),
    getSourceAgendas: uids => services.agendas
      .list({ uid: uids })
      .then(({ agendas }) => agendas),
  };
}

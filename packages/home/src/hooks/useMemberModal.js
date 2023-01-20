import axios from 'axios';

export default (res, agendaUid, memberEditModal) => {
  if (agendaUid && !memberEditModal.isOpen) {
    axios
      .get(res.agendas.get.replace(':agendaUid', agendaUid), {
        params: { includes: ['me.member', 'agenda'] },
      })
      .then(r => {
        memberEditModal.open({
          uid: r.data.agenda.uid,
          settings: r.data.agenda.settings,
          member: r.data.me.member,
          schema: r.data.agenda.memberSchema,
        });
        return r;
      });
  }
  return true;
};

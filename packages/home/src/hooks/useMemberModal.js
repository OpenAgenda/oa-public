import qs from 'qs';

export default (res, agendaUid, memberEditModal) => {
  if (agendaUid && !memberEditModal.isOpen) {
    const url = res.agendas.get.replace(':agendaUid', agendaUid);

    fetch(
      `${url}${url.includes('?') ? '&' : '?'}${qs.stringify({
        includes: ['me.member', 'agenda'],
      })}`,
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      })
      .then(data => {
        memberEditModal.open({
          uid: data.agenda.uid,
          settings: data.agenda.settings,
          member: data.me.member,
          schema: data.agenda.memberSchema,
          agenda: data.agenda,
        });
        return data;
      })
      .catch(err => {
        console.error('Error fetching agenda:', err);
      });
  }
  return true;
};

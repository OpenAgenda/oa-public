import { useEffect } from 'react';
import qs from 'qs';

export default function useMemberModal(res, agendaUid, memberEditModal) {
  useEffect(() => {
    if (!agendaUid || memberEditModal.isOpen) return;

    const url = res.agendas.get.replace(':agendaUid', agendaUid);
    const query = qs.stringify({
      includes: ['me.member', 'agenda'],
    });

    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}${query}`;

    fetch(finalUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        memberEditModal.open({
          uid: data.agenda.uid,
          settings: data.agenda.settings,
          member: data.me.member,
          schema: data.agenda.memberSchema,
          agenda: data.agenda,
        });
      })
      .catch((err) => {
        console.error('Error fetching agenda:', err);
      });
  }, [agendaUid, memberEditModal.isOpen, res]);
}

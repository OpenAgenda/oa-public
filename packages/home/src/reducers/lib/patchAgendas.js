import _ from 'lodash';

const memberLegacyFields = {
  name: 'contactName',
  position: 'contactPosition',
  email: 'email',
  organization: 'organization',
  number: 'contactNumber',
};

export default function patchAgendas(agendas, member, update) {
  const index = _.findIndex(agendas, a => a.uid === member.agendaUid);

  if (index === -1) {
    return agendas;
  }

  Object.keys(update).forEach(field => {
    if (memberLegacyFields[field]) {
      agendas[index].member.custom[memberLegacyFields[field]] = update[field];
    }
  });

  return agendas;
}

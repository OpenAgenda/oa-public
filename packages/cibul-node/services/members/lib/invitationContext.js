import _ from 'lodash';

export default function extractInvitationContext(
  invitation,
  agendaUid,
  defaultContext = null,
) {
  const action = _.get(invitation, 'data.actions', []).findLast(
    (v) => v.name === 'linkMember' && v.params[0].agendaUid === agendaUid,
  );
  return _.get(action, 'params.1', defaultContext); // message is in there
}

export function getLang(invitation, agendaUid, defaultLang = 'fr') {
  const context = extractInvitationContext(invitation, agendaUid);
  return _.get(context, 'lang', defaultLang);
}

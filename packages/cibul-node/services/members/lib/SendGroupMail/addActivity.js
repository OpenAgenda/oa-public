import logs from '@openagenda/logs';

const log = logs('services/members/sendGroupMail/addActivity');

export default async function addActivity(
  { activities },
  agenda,
  senderMember,
  data,
  recipientRoles,
) {
  if (!activities) {
    log.warn('activities service is not initialized. Not creating activity');
    return;
  }
  console.log('addSendGroupMailActivity', data);
  try {
    await activities.addActivity(
      { entityType: 'agenda', entityUid: agenda.uid },
      {
        actor: `user:${senderMember.userUid}`,
        verb: 'agenda.sendMessage',
        // object: `event:${after.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          labels: {
            actor:
              senderMember.custom?.contactName ?? senderMember.user.fullName,
            // object: before.title,
            target: agenda.title,
          },
          subject: data.subject,
          recipientRoles,
        },
        detail: { text: data.message },
      },
    );
  } catch (e) {
    log.error('Cannot add activity agenda.sendMessage', e);
  }
}

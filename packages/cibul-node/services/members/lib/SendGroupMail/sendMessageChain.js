import logs from '@openagenda/logs';
import sendMessage from './sendMessage.js';
import addActivity from './addActivity.js';
import updateContext from './updateContext.js';
import loadNextMember from './loadNextMember.js';

const log = logs('services/members/sendGroupMail/sendMessageChain');

export default async function sendMessageChain(
  config,
  { queue, services },
  jobData,
) {
  const { mails, tracker } = services;

  if (!mails) {
    log.warn(
      'mails services is not initialized. Interrupting sendMessageChange',
    );
    return;
  }

  const {
    agenda,
    query,
    data,
    senderMember,
    options = {},
    context = {},
  } = jobData;

  const logBundle = {
    agenda: { slug: agenda.slug, uid: agenda.uid },
    senderMemberUid: senderMember.userUid,
    data,
    options,
    context,
  };

  if (!context.after) {
    log.info('processing first item of message chain', logBundle);
  }

  const member = await loadNextMember(services, {
    agenda,
    query,
    data,
    context,
  });

  const isSender = member?.id === senderMember.id;
  const sendingToSender = (isSender || !member) && data.sendToMe && !context.isSentToMe;

  if (sendingToSender) {
    log.info('sending to sender', logBundle);
    tracker(`members.sendGroupMail.chain.toSender:${senderMember.userUid}`);
    await sendMessage(services, config, {
      agenda,
      member: senderMember,
      data,
      options,
    });
  } else if (member && !isSender) {
    tracker(`members.sendGroupMail.chain.toMember:${member.userUid}`);
    await sendMessage(services, config, {
      agenda,
      member,
      data,
      options,
    });
  }

  if (!member) {
    log.info('message chain was processed successfully.', logBundle);
    await addActivity(
      services,
      agenda,
      senderMember,
      data,
      context.recipientRoles,
    );
    tracker('members.sendGroupMail.successful', logBundle);
    return;
  }

  return queue.add('sendMessageChain', {
    agenda,
    query,
    data,
    senderMember,
    options,
    context: updateContext(context, member, {
      setSentToMe: sendingToSender,
    }),
  });
}

import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/inboxes/onMessageCreate');

async function inboxIdsToInboxUsers(services, inboxes, ids) {
  const { InboxUsers } = services.inboxes;

  return _.map(
    (
      await new InboxUsers().list(
        {
          inboxId: ids,
          leftAt: false,
        },
        0,
        10000,
      )
    ).data,
    (o) => ({ ...o, inbox: _.find(inboxes, ['id', o.inboxId]) }),
  );
}

async function getSenderName(services, { inboxUser, conversation, message }) {
  const { users: usersSvc, agendas: agendasSvc } = services;
  const { Inbox } = services.inboxes;

  const conv = await Inbox.user(inboxUser.userUid).conversations.get(
    conversation.id,
  );
  const msg = await conv.messages.get(message.id);

  if (msg.data.inboxUser) {
    return (
      await usersSvc.get(msg.data.inboxUser.userUid, {
        removed: false,
        detailed: true,
      })
    ).fullName;
  }

  if (msg.data.inbox.type === 'agenda') {
    return (
      await agendasSvc.get(
        { uid: msg.data.inbox.identifier },
        {
          private: null,
          includeImagePath: true,
        },
      )
    ).title;
  }
  if (msg.data.inbox.type === 'user') {
    return (
      await usersSvc.get(msg.data.inbox.identifier, {
        removed: false,
        detailed: true,
      })
    ).fullName;
  }
  if (msg.data.inbox.type === 'support') {
    return 'Support - OpenAgenda';
  }
}

async function sendMail(
  { services, mailsDomain, replyTos },
  { inboxUser, conversation, message, messageId, references, inReplyTo },
) {
  const { agendas: agendasSvc, members: membersSvc, mails, genUrl } = services;

  const { user, inbox } = inboxUser;
  const { culture: lang = 'fr' } = user;

  const logBundle = {
    userUid: user.uid,
  };

  log.info('sending mail', logBundle);

  const agenda = conversation.store.params && conversation.store.params.agendaUid
    ? await agendasSvc.get(
      { uid: conversation.store.params.agendaUid },
      { private: null, includeImagePath: true, internal: true },
    )
    : null;

  const logo = agenda && agenda.image
    ? { src: agenda.image.replace('.com/', '.com/rwtb'), width: '100px' }
    : { src: 'https://openagenda.com/images/openagenda.png', width: '300px' };

  const member = agenda
    ? await membersSvc.get({
      agendaUid: agenda.uid,
      userUid: user.uid,
    })
    : null;

  Object.assign(logBundle, { member, logo, agendaUid: agenda?.uid });

  const isAdminmod = agenda
    && member
    && [2, 3, '2', '3', 'administrator', 'moderator'].includes(member.role);

  let link;
  const unsubscriptions = [];

  if (isAdminmod) {
    link = genUrl.abs('agendaAdminInboxConversation', {
      slug: agenda.slug,
      conversationId: conversation.id,
    });
    unsubscriptions.push({
      rule: ['receive', 'agendaInboxMessage'],
      dataPath: 'unsubscribeLink',
    });
  }

  if (isAdminmod && member?.id) {
    unsubscriptions.push({
      memberId: member.id,
      rule: ['receive', 'agendaInboxMessage'],
      dataPath: 'memberUnsubscribeLink',
    });
  }

  if (inbox.type === 'support') {
    link = genUrl.abs('supportConversation', {
      conversationId: conversation.id,
    });
    unsubscriptions.push({
      rule: ['receive', 'userInboxMessage'],
      dataPath: 'unsubscribeLink',
    });
  }

  if (!isAdminmod && inbox.type !== 'support') {
    link = genUrl.abs('homeInboxConversation', {
      conversationId: conversation.id,
    });
    unsubscriptions.push({
      rule: ['receive', 'userInboxMessage'],
      dataPath: 'unsubscribeLink',
    });
  }

  const senderName = await getSenderName(services, {
    inboxUser,
    conversation,
    message,
  });

  const agendaTitle = agenda ? agenda.title : null;

  const sendData = {
    messageId,
    template: 'inboxMessage',
    from: {
      name: senderName,
      address: `notifications@${mailsDomain}`,
    },
    replyTo: {
      name: agendaTitle || 'OpenAgenda',
      address: `reply+${user.replyToken}@${mailsDomain}`,
    },
    to: {
      name: agendaTitle,
      address: `${conversation.id}.${agenda ? agenda.slug : 'inbox'}@${mailsDomain}`,
      unsubscriptions,
    },
    cc: {
      name: member?.custom?.contactName?.length
        ? member.custom.contactName
        : user.fullName,
      address:
        replyTos.find((rt) => rt.userUid === user.uid)?.replyTo ?? user.email,
      unsubscriptions,
    },
    data: {
      logo,
      link,
      senderName,
      agenda: agendaTitle,
      message: message.body,
    },
    inReplyTo,
    references,
    lang,
  };

  log.info('sending', Object.assign(logBundle, { sendData }));

  return mails.send(sendData);
}

export default async function onMessageCreate(
  { services, mailsDomain },
  conversation,
  message,
) {
  const { users: usersSvc, inboxes } = services;

  log.info('new message', {
    conversation: _.pick(conversation, ['id', 'type']),
    isNewConversation:
      conversation.latestMessage.createdAt - conversation.createdAt < 100,
    storeParams: conversation.store?.params,
  });

  try {
    const [inboxesAgenda, inboxesUser] = _.partition(conversation.inboxes, [
      'type',
      'user',
    ]);

    const inboxUsersToNotify = _([
      ...await inboxIdsToInboxUsers(
        services,
        conversation.inboxes,
        _.map(inboxesAgenda, 'id'),
      ),
      ...await inboxIdsToInboxUsers(
        services,
        conversation.inboxes,
        _.map(inboxesUser, 'id'),
      ),
    ])
      .reject(['userUid', message.inboxUser.userUid])
      .uniqBy('userUid')
      .value();

    log(
      'sending mails to %d users to notify new message',
      inboxUsersToNotify.length,
    );

    const chunks = _.chunk(inboxUsersToNotify, 100);

    for (const chunk of chunks) {
      const users = (
        await usersSvc.find({
          query: {
            uid: {
              $in: _.map(chunk, 'userUid'),
            },
            $skip: 0,
            $limit: chunk.length,
          },
          removed: false,
          detailed: true,
          internal: true,
        })
      ).data;

      const sendMailPromises = [];

      const { messageId, references, inReplyTo } = await inboxes
        .emailUtils(conversation.id)
        .messageIds.generateMailBundle(message)
        .catch((error) => {
          log.error('failed to list References to add to created message', {
            error,
            conversationId: conversation.id,
          });
          return {};
        });

      const replyTos = await inboxes
        .emailUtils(conversation.id)
        .replyTos.list();

      for (const user of users) {
        const inboxUserToNotify = _.chain(inboxUsersToNotify)
          .remove(['userUid', user.uid])
          .head()
          .assign({ user })
          .value();

        sendMailPromises.push(
          sendMail(
            { services, mailsDomain, replyTos },
            {
              inboxUser: inboxUserToNotify,
              conversation,
              message,
              messageId,
              references,
              inReplyTo,
            },
          ),
        );
      }

      Promise.all(sendMailPromises).catch((e) => {
        log('error', e);
      });

      try {
        await inboxes.emailUtils(conversation.id).messageIds.insert(messageId);
      } catch (error) {
        log.error('failed to reference sent messageId', {
          messageId,
          conversationId: conversation.id,
          error,
        });
      }
    }
  } catch (e) {
    log('error', e);
  }
}

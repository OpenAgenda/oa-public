'use strict';

const _ = require('lodash');
const qs = require('qs');

const invitations = require('@openagenda/invitations');

const log = require('@openagenda/logs')('services/members/messages');

const mails = require('../../mails');
const agendaLogo = require('./agendaLogo');
const invitationContext = require('./invitationContext');

async function _loadInvitation(member) {
  if (member.userUid) return null;
  if (!_.get(member, 'custom.email')) return null;

  return invitations
    .get({ email: member.custom.email })
    .then(r => (r ? r.invitation : null));
}

async function addActivity(config, activities, data, recipientRoles) {
  try {
    const senderName = data.sender.custom?.contactName ?? data.sender.user.fullName;

    await activities.feed({ entityType: 'agenda', entityUid: data.agenda.uid }).activities.add({
      actor: `user:${data.sender.userUid}`,
      verb: 'agenda.sendMessage',
      // object: `event:${after.uid}`,
      target: `agenda:${data.agenda.uid}`,
      store: {
        labels: {
          actor: senderName,
          // object: before.title,
          target: data.agenda.title,
        },
        subject: data.subject,
        recipientRoles,
      },
    });
  } catch (e) {
    log.error('Cannot add activity agenda.sendMessage', e);
  }
}

async function _sendMessage(config, member, { subject, message, agenda, lang, replyTo }) {
  const email = _.get(
    member,
    'custom.email',
    _.get(member, 'user.email'),
  );

  if (!email) {
    return log('member is not associated to an email');
  }
  log('processing sendMessage to email %s', email);

  const invitation = await _loadInvitation(member);

  const appliedLang = invitation
    ? invitationContext.getLang(invitation, lang)
    : lang;

  const link = invitation
    ? `${config.root}/${agenda.slug}/signup?${qs.stringify({
      invitation: invitation.token,
      email,
      lang: appliedLang,
    })}`
    : `${config.root}/${agenda.slug}?lang=${appliedLang}`;

  return mails.send({
    template: 'memberMessage',
    to: {
      address: email,
      unsubscriptions: [{
        rule: ['receive', 'memberMessage'],
        dataPath: 'unsubscribeLink',
      }].concat(member.userUid ? [{
        memberId: member.id,
        rule: ['receive', 'memberMessage'],
        dataPath: 'memberUnsubscribeLink',
      }] : []),
    },
    replyTo,
    data: {
      logo: agendaLogo(config, agenda),
      link,
      agenda: agenda.title,
      subject,
      message,
    },
    lang: appliedLang,
  });
}

async function sendMessageChain(config, { queue, members, activities }, jobData) {
  const { query, data } = jobData;
  const context = {
    recipientRoles: {},
    ...jobData.context,
  };

  if (!context.sentToMe) {
    if (data.sendToMe) {
      try {
        await _sendMessage(config, data.sender, data);
        context.recipientRoles[data.sender.role] = (context.recipientRoles[data.sender.role] || 0) + 1;
      } catch (e) {
        log.error('Cannot send message to member', data.sender.uid);
      }
    }
    context.sentToMe = true;
    await queue.add('sendMessageChain', { query, data, context });
    return;
  }

  const [member] = await members.list({
    ...query,
    withActions: data.withActions,
    deletedUsers: false,
  }, {
    after: context.after || 0,
    limit: 1,
  });

  if (!member) {
    await addActivity(config, activities, data, context.recipientRoles);
    return;
  }

  context.after = member.id;

  // Don't send twice to "me"
  if (data.sendToMe && data.sender.id === member.id) {
    await queue.add('sendMessageChain', { query, data, context });
    return;
  }

  try {
    await _sendMessage(config, member, data);
    context.recipientRoles[member.role] = (context.recipientRoles[member.role] || 0) + 1;
  } catch (e) {
    log.error('Cannot send message to member', member.uid);
  }

  await queue.add('sendMessageChain', { query, data, context });
}

async function task(config, { queue, bull, members, activities }) {
  log('task');

  const worker = new bull.Worker(queue.name, async job => {
    switch (job.name) {
      case 'sendMessageChain':
        await sendMessageChain(config, { queue, members, activities }, job.data);
        break;
      default:
        log.warn(`Unkown job ${job.name}`);
    }
  }, {
    prefix: queue.opts.prefix,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // keep up to 7 days
      count: 1000, // keep up to 1000 jobs
    },
  });

  worker.on('error', failedReason => log.error('error', failedReason));
  worker.on('failed', (job, error) => log.error(job.name, 'failed', job.data, error));
  // worker.on('active', job => {});
  worker.on('completed', (job, result, prev) => log.debug(job.name, 'completed', prev));

  /* queue.register({
    stream: async (query, data) => {
      if (data.sendToMe) {
        queue('sendMessage', data.sender, data);
      }

      const { total } = await members.list({
        ...query,
        withActions: data.withActions,
        deletedUsers: false,
      }, {
        limit: 0,
      }, {
        includeTotal: 0,
      });

      console.log('TOTAL', total);

      members
        .stream({
          ...query,
          withActions: data.withActions,
          deletedUsers: false,
          detailed: true,
        })
        .on('data', member => queue('sendMessage', member, data)); // TODO ignore if data.sender === member
    },
    sendMessage: _sendMessage.bind(null, config),

    // sendMessageChain:
  });

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => {});
  queue.on('success', (fn, args, result) => log(fn, 'success'));

  queue.run(); */
}

module.exports = (config, { bull, members, activities, queueName }) => {
  const queue = new bull.Queue(queueName, { prefix: `{${queueName}}` });

  return Object.assign((query, data) => queue.add('sendMessageChain', { query, data }), {
    task: () => task(config, { queue, bull, members, activities }),
  });
};

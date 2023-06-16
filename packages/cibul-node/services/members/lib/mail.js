'use strict';

const _ = require('lodash');
const invitations = require('@openagenda/invitations');
const log = require('@openagenda/logs')('members/mail');
const base64 = require('@openagenda/utils/base64');
const mails = require('../../mails');

const agendaLogo = require('./agendaLogo');
const extractInvitationContext = require('./invitationContext');
const messages = require('./messages');

async function createSenderActivity(services, { agenda, invitationContext, member }) {
  const {
    activities
  } = services;

  const user = await services.users.findOne({
    query: {
      uid: invitationContext.sender.userUid
    }
  });

  if (!user) {
    throw new Error('Sender not found');
  }

  return activities.feed({
    entityType: 'agenda',
    entityUid: agenda.uid
  }).activities.add({
    actor: `user:${user.uid}`,
    verb: 'agenda.sendInvitation',
    object: `email:${member.custom.email}`,
    target: `agenda:${agenda.uid}`,
    store: {
      labels: {
        actor: invitationContext.sender.memberName || user.fullName,
        object: member.custom.email,
        target: agenda.title
      },
      role: member.role
    }
  });
}

function processSend({ config, services }, {
  invitation, member, agenda, message, lang, footnote, redirect = null,
}) {
  const {
    members,
  } = services;

  const isMember = !!member.userUid;
  const role = members.utils.getRoleSlug(member.role);
  let link = `${config.root}/agendas/${agenda.uid}?lang=${lang}`;

  if (invitation) {
    link = `${config.root}/${agenda.slug}/signup?lang=${lang}&email=${member.custom.email}&invitation=${invitation.token}`;
    if (redirect) {
      link = `${config.root}/${agenda.slug}/signup?lang=${lang}&email=${member.custom.email}&invitation=${invitation.token}&redirect=${base64.encode(redirect)}`;
    }
  } else if (isMember) {
    if (role === 'administrator' || role === 'moderator') {
      link = `${config.root}/agendas/${agenda.uid}/admin/events`;
    } else if (role === 'contributor') {
      link = `${config.root}/agendas/${agenda.uid}/contribute`;
    }
  }

  log('sending link', link, message);

  return mails.send({
    template: 'memberInvitation',
    to: {
      address: member.custom.email,
      unsubscriptions: [
        {
          rule: ['receive', 'invitation'],
          dataPath: 'unsubscribeLink'
        }
      ]
    },
    data: {
      logo: agendaLogo(config, agenda),
      link,
      agenda: agenda.title,
      role,
      message,
      footnote,
      isMember
    },
    lang
  });
}

async function send({ config, services }, {
  member, context, agenda, message,
}) {
  log('send');

  const lang = _.get(context, 'lang', 'fr');

  return processSend({ config, services }, {
    member,
    agenda,
    message,
    lang,
  });
}

async function sendInvitation({ services, config }, {
  invitation, member, context, agenda,
}) {
  const invitationContext = extractInvitationContext(invitation, agenda.uid, context);
  try {
    await createSenderActivity(services, { agenda, invitationContext, member });
  } catch (e) {
    log('error', 'could not create sender activity', e);
  }

  const lang = _.get(invitationContext, 'lang', 'fr');

  return processSend({ config, services }, {
    invitation,
    member,
    agenda,
    message: invitationContext?.message,
    footnote: agenda.settings?.contribution?.messages?.GDPRInformation,
    lang,
    redirect: invitationContext?.redirect,
  });
}

async function resendInvitation({ services, config }, { agenda, member }) {
  const {
    invitation
  } = await invitations.get({ email: member.custom.email });

  if (!invitation) {
    throw new Error('There is no invitation for this member');
  }

  return sendInvitation({ services, config }, { invitation, agenda, member });
}

module.exports = {
  sendInvitation,
  send,
  resendInvitation,
  messages
};

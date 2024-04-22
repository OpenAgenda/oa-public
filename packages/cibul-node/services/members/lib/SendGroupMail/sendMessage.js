'use strict';

const qs = require('qs');

const log = require('@openagenda/logs')('services/members/sendGroupMail/sendMessage');
const invitationContext = require('../invitationContext');
const agendaLogo = require('../agendaLogo');

async function loadInvitation(services, member) {
  const {
    invitations,
  } = services;

  if (member.userUid || !member.custom?.email) {
    return null;
  }

  return invitations
    .get({ email: member.custom.email })
    .then(r => (r ? r.invitation : null));
}

module.exports = async function sendMessage(services, config, {
  agenda,
  member,
  data,
  options,
}) {
  const {
    mails,
    tracker,
  } = services;

  const {
    subject, message, replyTo,
  } = data;

  const {
    lang = 'fr',
    throwOnError = false,
  } = options ?? {};

  try {
    const email = member.custom?.email ?? member.user.email;

    if (!email) {
      return log('member is not associated to an email');
    }
    log('processing sendMessage to email %s', email);

    const invitation = await loadInvitation(services, member);

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

    const result = await mails.send({
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

    tracker(`members.sendGroupMail.sentMessageTo:${member.userUid},${email},${subject}`);

    return result;
  } catch (e) {
    if (throwOnError) {
      throw e;
    }
    log.error('Cannot send message to member', {
      recipientUserUid: member.uid,
      error: e,
    });
  }
};

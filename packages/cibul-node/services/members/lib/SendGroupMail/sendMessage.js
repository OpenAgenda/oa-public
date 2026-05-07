import qs from 'qs';
import logs from '@openagenda/logs';
import * as invitationContext from '../invitationContext.js';
import agendaLogo from '../agendaLogo.js';

const log = logs('services/members/sendGroupMail/sendMessage');

async function loadInvitation(services, member) {
  const { invitations } = services;

  if (member.userUid || !member.custom?.email) {
    return null;
  }

  return invitations
    .get({ email: member.custom.email })
    .then((r) => (r ? r.invitation : null));
}

export default async function sendMessage(
  services,
  config,
  { agenda, member, data, options },
) {
  const { mails, tracker } = services;

  const { subject, message, replyTo } = data;

  const { lang = 'fr', throwOnError = false } = options ?? {};

  try {
    const email = member.custom?.email ?? member.user.email;

    if (!email) {
      return log('member is not associated to an email');
    }
    log('processing sendMessage to email %s', email);

    const invitation = await loadInvitation(services, member);

    const appliedLang = invitation
      ? invitationContext.getLang(invitation, agenda.uid, lang)
      : lang;

    // Phase 6 lot 6 — invitation links land on `/{slug}?auth=signup&…` so
    // the recipient sees the agenda context (header, branding) and the
    // signup is offered in-modal via `InvitationAuthDialog` rather than on
    // the neutral `/auth/signup` page. See services/members/lib/mail.js for
    // the full flow rationale (post-activate hop, redirect base64).
    const link = invitation
      ? `${config.root}/${agenda.slug}?${qs.stringify({
        auth: 'signup',
        invitation: invitation.token,
        email,
        lang: appliedLang,
        redirect: Buffer.from(`/${agenda.slug}/contribute`, 'utf-8').toString(
          'base64',
        ),
      })}`
      : `${config.root}/${agenda.slug}?lang=${appliedLang}`;

    const result = await mails.send({
      template: 'memberMessage',
      to: {
        address: email,
        unsubscriptions: [
          {
            rule: ['receive', 'memberMessage'],
            dataPath: 'unsubscribeLink',
          },
        ].concat(
          member.userUid
            ? [
              {
                memberId: member.id,
                rule: ['receive', 'memberMessage'],
                dataPath: 'memberUnsubscribeLink',
              },
            ]
            : [],
        ),
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

    tracker(
      `members.sendGroupMail.sentMessageTo:${member.userUid},${email},${subject}`,
    );

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
}

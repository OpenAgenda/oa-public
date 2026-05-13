import _ from 'lodash';
import * as invitations from '@openagenda/invitations';
import logs from '@openagenda/logs';
import base64 from '@openagenda/utils/base64.js';
import agendaLogo from './agendaLogo.js';
import extractInvitationContext from './invitationContext.js';

const log = logs('services/members/mail');

async function createSenderActivity(
  services,
  { agenda, invitationContext, member },
) {
  const { activities } = services;

  const user = await services.users.findOne({
    query: {
      uid: invitationContext.sender.userUid,
    },
  });

  if (!user) {
    throw new Error('Sender not found');
  }

  return activities.addActivity(
    {
      entityType: 'agenda',
      entityUid: agenda.uid,
    },
    {
      actor: `user:${user.uid}`,
      verb: 'agenda.sendInvitation',
      object: `email:${member.custom.email}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: invitationContext.sender.memberName || user.fullName,
          object: member.custom.email,
          target: agenda.title,
        },
        role: member.role,
      },
    },
  );
}

function processSend(
  { config, services },
  { invitation, member, agenda, message, lang, footnote, redirect = null },
) {
  const { members, mails } = services;

  const isMember = !!member.userUid;
  const role = members.utils.getRoleSlug(member.role);
  let link = `${config.root}/agendas/${agenda.uid}?lang=${lang}`;

  if (invitation) {
    // Phase 6 lot 6 — point invitations at the agenda show page so the
    // recipient lands in context (header, branding, agenda title) rather
    // than on the neutral `/auth/signup` page. `InvitationAuthDialog`
    // (mounted on `/{slug}` in AgendaShow) reads `?auth=signup&...` and
    // opens the AuthDialog modal pre-filled with invitation/email/redirect.
    // The Next proxy (packages/next/src/proxy.ts) honours `?lang` for any
    // path, so `/{slug}?lang=…` still hops to the right locale segment.
    // Post-activation, BA verifyEmail → /post-activate applies the
    // invitation token (linkMember etc.) and lands the user on
    // `/{slug}/contribute` (or the supplied `redirect`).
    const baseRedirect = redirect || `/${agenda.slug}/contribute`;
    link = `${config.root}/${agenda.slug}?auth=signup&lang=${lang}&email=${encodeURIComponent(member.custom.email)}&invitation=${invitation.token}&redirect=${base64.encode(baseRedirect)}`;
  } else if (isMember) {
    if (role === 'administrator' || role === 'moderator') {
      link = `${config.root}/${agenda.slug}/admin/events`;
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
          dataPath: 'unsubscribeLink',
        },
      ],
    },
    data: {
      logo: agendaLogo(config, agenda),
      link,
      agenda: agenda.title,
      role,
      message,
      footnote,
      isMember,
    },
    lang,
  });
}

export async function send(
  { config, services },
  { member, context, agenda, message },
) {
  log('send');

  const lang = _.get(context, 'lang', 'fr');

  return processSend(
    { config, services },
    {
      member,
      agenda,
      message,
      lang,
    },
  );
}

export async function sendInvitation(
  { services, config },
  { invitation, member, context, agenda },
) {
  const invitationContext = extractInvitationContext(
    invitation,
    agenda.uid,
    context,
  );
  try {
    await createSenderActivity(services, { agenda, invitationContext, member });
  } catch (e) {
    log('error', 'could not create sender activity', e);
  }

  const lang = _.get(invitationContext, 'lang', 'fr');

  return processSend(
    { config, services },
    {
      invitation,
      member,
      agenda,
      message: invitationContext?.message,
      footnote: agenda.settings?.contribution?.messages?.GDPRInformation,
      lang,
      redirect: invitationContext?.redirect,
    },
  );
}

export async function resendInvitation(
  { services, config },
  { agenda, member },
) {
  const { invitation } = await invitations.get({ email: member.custom.email });

  if (!invitation) {
    throw new Error('There is no invitation for this member');
  }

  return sendInvitation({ services, config }, { invitation, agenda, member });
}

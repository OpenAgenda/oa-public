import _ from 'lodash';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import membersSvc from '@openagenda/members';
import { send, sendInvitation } from './lib/mail.js';
import clearCache from './lib/clearCache.js';
import { addMemberCreate } from './lib/activities.js';

const {
  utils: {
    compareRoles: { isSuperiorToOrEqual },
  },
} = membersSvc;

const log = logs('services/members/onCreate');

async function _memberIsExistingUser(
  { services, config },
  { member, user, agenda, context },
) {
  log('member is existing user', member);

  const { inboxes, activities } = services;

  const { Inbox } = inboxes || {};

  if (user.isNew) {
    await services.users.setNewFlag(user.uid, { isNew: false });
  }

  if (Inbox) {
    if (isSuperiorToOrEqual(member.role, 'moderator')) {
      try {
        await new Inbox({
          type: 'agenda',
          identifier: agenda.uid,
        }).users.add({
          userUid: user.uid,
        });
      } catch (e) {
        log('error', 'could not add member to agenda inbox', e);
      }
    }
  } else {
    log('warn', 'inboxes service was not initialized');
  }

  if (!activities) {
    log('warn', 'activities service was not initialized');
    return;
  }

  const userFeedId = { entityType: 'user', entityUid: user.uid };
  const agendaFeedId = { entityType: 'agenda', entityUid: agenda.uid };
  try {
    await activities
      .feed(userFeedId)
      .follow(agendaFeedId, { credential: member.role });
  } catch (e) {
    log('error', 'could not make user feed follow agenda feed', member.id);
  }

  const senderUserUid = _.get(context, 'sender.userUid');

  // If it's an agenda creation
  if (!senderUserUid) {
    return;
  }

  const senderUser = await services.users.findOne({
    query: { uid: senderUserUid },
    removed: null,
  });

  if (!senderUser) throw new VError('Sender user %j not found', { uid: senderUserUid });

  if (!context.silent) {
    await send(
      { config, services },
      {
        member,
        agenda,
        context,
        message: context.message,
      },
    );
  } else {
    log('info', 'mailing bypassed by silent option for member', member.id);
  }

  try {
    await addMemberCreate(services, {
      user,
      member,
      agenda,
      context,
      senderUser,
    });
  } catch (e) {
    log(
      'error',
      'could not add addMember activity to agenda feed',
      agenda,
      member,
      e,
    );
  }
}

async function _memberIsInvitedNonUser(
  { services, config },
  { member, agenda, context },
) {
  const { invitations } = services;

  if (!invitations) {
    log('warn', 'invitations service was not initialized');
    return;
  }

  log('member is not existing user, is invited');

  const { invitation } = await invitations.assign(
    {
      email: member.custom.email,
    },
    'linkMember',
    [member, context],
  );

  if (!context.silent) {
    return sendInvitation(
      { services, config },
      {
        invitation,
        member,
        context,
        agenda,
      },
    );
  }

  log(
    'info',
    'invitation mailing bypassed by silent option for member',
    member.id,
  );
}

export default async ({ services, config }, member, context) => {
  log('created', member);

  const { agendas } = services;

  await clearCache(services, member);

  try {
    const agenda = await agendas.get(
      {
        uid: member.agendaUid,
      },
      {
        private: null,
        includeImagePath: true,
      },
    );

    if (!agenda) {
      throw new Error('Agenda not found');
    }

    const user = member.userUid
      ? await services.users.findOne({
        query: { uid: member.userUid },
        removed: null,
      })
      : null;

    if (!user && member.userUid) {
      throw new Error('User not found');
    }

    if (member.userUid) {
      return _memberIsExistingUser(
        { services, config },
        { member, user, agenda, context },
      );
    }
    return _memberIsInvitedNonUser(
      { services, config },
      { member, agenda, context },
    );
  } catch (e) {
    log('error', 'failed', { member, exception: e });
  }
};

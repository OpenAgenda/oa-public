'use strict';

const _ = require('lodash');

const agendas = require('@openagenda/agendas');
const invitations = require('@openagenda/invitations');
const log = require('@openagenda/logs')('services/members/onPatch');
const clearCache = require('./lib/clearCache');
const { sendInvitation } = require('./lib/mail');

async function onNewMember({ services, agenda, user, senderUser, context, member, activityQueue }) {
  const usersSvc = services.users;
  const {
    activities,
    members: {
      utils: {
        compareRoles: {
          isSuperiorToOrEqual,
        },
      },
    },
    legacy: {
      controlData: controlDataSvc,
    },
  } = services;
  const { Inbox } = services.inboxes;

  if (user.isNew) {
    await usersSvc.setNewFlag(user.uid, { isNew: false });
  }

  try {
    await controlDataSvc.memberSet({
      agendaUid: agenda.uid,
      userUid: user.uid,
      role: member.role,
    });
  } catch (e) {
    log('error', 'could not set member in control data', member, e);
  }

  await activities.feed({
    entityType: 'user',
    entityUid: user.uid,
  }).follow({
    entityType: 'agenda',
    entityUid: agenda.uid,
  }, {
    credential: member.role,
  });

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

  await activityQueue('addMemberAcceptInvitation', {
    agenda, user, senderUser, member, context,
  });
}

module.exports = async function onPatch({ services, config, activityQueue }, before, member, context) {
  log('patched', member);

  const {
    inboxes,
    users: usersSvc,
    members: {
      utils: {
        compareRoles: {
          isSuperiorToOrEqual,
        },
      },
    },
  } = services;

  try {
    const agenda = await agendas.get({ uid: member.agendaUid }, {
      private: null,
      includeImagePath: true,
    });

    await clearCache(services, member);

    if (!agenda) throw new Error('Agenda not found');

    const user = member.userUid ? await usersSvc.findOne({
      query: { uid: member.userUid },
      removed: null,
    }) : null;

    if (!user && member.userUid) throw new Error('User not found');

    const senderUser = await usersSvc.findOne({
      query: { uid: _.get(context, 'sender.userUid') },
      removed: null,
    });

    const agendaInbox = inboxes ? new inboxes.Inbox({
      type: 'agenda',
      identifier: agenda.uid,
    }) : null;

    const isNewMember = member.userUid && !before.userUid;
    const hasChangedRole = member.userUid && (before.role !== member.role);
    const isPromotedToAdminMod = hasChangedRole
      && !isSuperiorToOrEqual(before.role, 'moderator')
      && isSuperiorToOrEqual(member.role, 'moderator');
    const isDemotedToContributor = hasChangedRole
      && isSuperiorToOrEqual(before.role, 'moderator')
      && !isSuperiorToOrEqual(member.role, 'moderator');
    const isDeleted = member.deletedUser && !before.deletedUser;
    const emailChanged = before.custom.email !== member.custom.email;

    if (isNewMember) {
      log('user is a newly associated member');
      if (!senderUser) throw new Error('Sender user not found');
      try {
        await onNewMember({ services, agenda, user, senderUser, context, member, activityQueue });
      } catch (e) {
        log('error', 'failed to register new member', e);
      }
    } else if (hasChangedRole) {
      log('member has changed role');
      try {
        await activityQueue('addMemberRoleChange', { user, before, member, agenda, context, senderUser });
      } catch (e) {
        log('error', 'failed to process role change', e);
      }
    }

    if (agendaInbox && (isDemotedToContributor || isDeleted)) {
      log('demotion or deletion');
      try {
        await agendaInbox.users.remove({
          userUid: user.uid,
        });
      } catch (e) {
        log('error', 'failed to remove user from agenda inbox', { member, exception: e });
      }
    } else if (agendaInbox && isPromotedToAdminMod) {
      log('promotion');
      try {
        await agendaInbox.users.add({
          userUid: user.uid,
        });
      } catch (e) {
        log('error', 'failed to add user to agenda inbox', { member, exception: e });
      }
    }

    let invitation;

    // handle invitations
    if (before.custom.email && (isDeleted || emailChanged)) {
      const getResult = await invitations.get({ email: before.custom.email });
      invitation = getResult.invitation;
    }

    if (invitation) {
      log('an invitation is linked to member', invitation, member.id);
    } else {
      log('no invitation is linked to member', member.id);
    }

    if (invitation && isDeleted) {
      try {
        await invitations.remove({ email: before.custom.email });
      } catch (e) {
        log('error', 'failed to remove invitation', e);
      }
    } else if (invitation && emailChanged) {
      try {
        invitation.email = member.custom.email;
        await invitation.save();
        await sendInvitation({ services, config }, {
          invitation, member, context, agenda,
        });
      } catch (e) {
        log('error', 'failed to update invitation', e);
      }
    }
  } catch (e) {
    log('error', 'failed', { member, exception: e });
  }
};

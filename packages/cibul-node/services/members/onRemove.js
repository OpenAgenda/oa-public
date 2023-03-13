'use strict';

const _ = require('lodash');
const { isSuperiorToOrEqual } = require('@openagenda/members').utils.compareRoles;
const logs = require('@openagenda/logs');

async function removeInvitationsToMember({ invitations }, member) {
  const { invitation } = await invitations.get({ email: member.custom.email });

  if (!invitation) return;

  const action = invitation.data.actions.find(v => v.name === 'linkMember' && v.params[0].id === member.id);

  if (!action) return;

  if (invitation.data.actions.length > 1) {
    await invitation.removeAction(action.id);
  } else {
    await invitation.remove();
  }
}

module.exports = function onRemove({ services, members, activityQueue }) {
  const log = logs('services/members/onRemove');

  return async (member, context) => {
    log('removed', member);

    const {
      users: usersSvc,
      activities,
      agendas,
      invitations,
      inboxes,
      legacy: {
        controlData: controlDataSvc,
      },
    } = services;

    const { Inbox } = inboxes;

    try {
      const { user } = context; // user removing
      const agenda = await agendas.get({ uid: member.agendaUid }, { private: null });

      if (!agenda) throw new Error('Agenda not found');

      if (!member.userUid) { // member removed
        log('removed member is not linked to a user account', member);
        return;
      }

      // removed user
      const memberUser = await usersSvc.findOne({
        query: { uid: member.userUid },
      });

      if (!memberUser) {
        throw new Error('User not found');
      }

      // loading member removing
      const userMember = member.userUid === user.uid
        ? member
        : await members.get({
          agendaUid: agenda.uid,
          userUid: user.uid,
        });

      try {
        await activityQueue('addMemberRemove', {
          user, // user removing
          member, // member removed
          agenda,
          userMember, // member removing
          memberUser, // user removed
        });
      } catch (e) {
        log('error', 'failed adding activity of type agenda.removeMember', { member, exception: e });
      }

      try {
        await controlDataSvc.memberRemove({
          agendaUid: agenda.uid,
          userUid: memberUser.uid,
        });
      } catch (e) {
        log('error', 'failed removing member from control data', { member, exception: e });
      }

      try {
        await activities.feed({
          entityType: 'user',
          entityUid: memberUser.uid,
        }).unfollow({
          entityType: 'agenda',
          entityUid: agenda.uid,
        });
      } catch (e) {
        log('error', 'failed user unfollow on agenda', { member, exception: e });
      }

      if (isSuperiorToOrEqual(member.role, 'moderator')) {
        try {
          await new Inbox({
            type: 'agenda',
            identifier: agenda.uid,
          }).users.remove({
            userUid: memberUser.uid,
          });
        } catch (e) {
          log('error', 'failed to remove user from agenda inbox', { member, exception: e });
        }
      }

      if (_.get(member, 'custom.email')) {
        try {
          await removeInvitationsToMember({ invitations }, member);
        } catch (e) {
          log('error', 'failed to remove invitations made to member', { member, exception: e });
        }
      }
    } catch (e) {
      log('error', 'failed', { member, exception: e });
    }
  };
};

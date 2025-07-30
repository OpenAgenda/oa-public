import _ from 'lodash';

export function addMemberCreate(
  services,
  { user, member, agenda, senderUser, context },
) {
  const { activities } = services;
  return activities.addActivity(
    {
      entityType: 'agenda',
      entityUid: agenda.uid,
    },
    {
      actor: `user:${senderUser.uid}`,
      verb: 'agenda.addMember',
      object: `user:${user.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: context.sender.memberName || senderUser.fullName,
          object: _.get(member, 'custom.contactName') || user.fullName,
          target: agenda.title,
        },
        role: member.role,
      },
    },
  );
}

export function addMemberRemove(
  services,
  { user, member, agenda, userMember, memberUser },
) {
  const { activities } = services;

  return activities.addActivity(
    {
      entityType: 'agenda',
      entityUid: agenda.uid,
    },
    {
      actor: `user:${user.uid}`, // user removing
      verb: 'agenda.removeMember',
      object: `user:${memberUser.uid}`, // user being removed
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: userMember.custom.contactName || user.fullName, // member removing
          object: member.custom.contactName || memberUser.fullName, // member that was removed
          target: agenda.title,
        },
        role: member.role,
      },
    },
  );
}

export async function addMemberRoleChange(
  services,
  { user, before, member, agenda, context, senderUser },
) {
  const { activities } = services;
  const userFeed = activities.feed({
    entityType: 'user',
    entityUid: user.uid,
  });

  await userFeed.unfollow({
    entityType: 'agenda',
    entityUid: agenda.uid,
  });

  await userFeed.follow(
    {
      entityType: 'agenda',
      entityUid: agenda.uid,
    },
    { credential: member.role },
  );

  await activities.addActivity(
    {
      entityType: 'agenda',
      entityUid: agenda.uid,
    },
    {
      actor: `user:${senderUser.uid}`,
      verb: 'agenda.setMemberRole',
      object: `user:${user.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: context.sender.memberName || senderUser.fullName,
          object: member.custom.contactName || user.fullName,
          target: agenda.title,
        },
        beforeRole: before.role,
        role: member.role,
      },
    },
  );
}

export function addMemberAcceptInvitation(
  services,
  { agenda, user, senderUser, member, context },
) {
  const { activities } = services;
  return activities.addActivity(
    {
      entityType: 'agenda',
      entityUid: agenda.uid,
    },
    {
      actor: `user:${user.uid}`,
      verb: 'agenda.acceptInvitation',
      object: `user:${senderUser.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: member.custom.contactName || user.fullName,
          object: context.sender.memberName || senderUser.fullName,
          target: agenda.title,
        },
        role: member.role,
      },
    },
  );
}

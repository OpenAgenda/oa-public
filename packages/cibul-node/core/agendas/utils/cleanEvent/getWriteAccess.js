import membersSvc from '@openagenda/members';

const { getRoleSlug } = membersSvc.utils;

export default function getWriteAccess(member, access) {
  return member ? getRoleSlug(member.role) : access;
}

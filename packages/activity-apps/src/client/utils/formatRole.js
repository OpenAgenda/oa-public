import rolesMessages from '@openagenda/common-labels/roles';

const roleIdToLabel = {
  '1': 'contributor',
  '2': 'administrator',
  '3': 'moderator',
  '4': 'reader',
};

export default function getRoleLabel(intl, role) {
  const message = rolesMessages[roleIdToLabel[role]];
  if (!message) {
    console.log(`Missing message for role "${role}"`);
  }
  return intl.formatMessage(message).toLowerCase();
}

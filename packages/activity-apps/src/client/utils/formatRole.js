import rolesMessages from '@openagenda/common-labels/roles';
import messages from '../messages/activities';

const roleIdToLabel = {
  '1': 'contributor',
  '2': 'administrator',
  '3': 'moderator',
  '4': 'reader',
};

const roleIdToXLabel = {
  '1': 'XContributors',
  '2': 'XAdministrators',
  '3': 'XModerators',
  '4': 'XReaders',
};

export function formatRole(intl, role) {
  const message = rolesMessages[roleIdToLabel[role]];
  if (!message) {
    console.log(`Missing message for role "${role}"`);
  }
  return intl.formatMessage(message).toLowerCase();
}

export function formatXRole(intl, role, count) {
  const message = messages[roleIdToXLabel[role]];
  if (!message) {
    console.log(`Missing message for role "${role}"`);
  }
  return intl.formatMessage(message, { count }).toLowerCase();
}

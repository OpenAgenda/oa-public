import emailsValidator from '../../utils/emailsValidator';

function getRoleOptions({
  getLabel,
  isAgendaPrivate,
  areModeratorsEnabled,
  modoCanInviteModo,
  userCredential,
}) {
  const roles = [];

  if (isAgendaPrivate) {
    roles.push({
      id: 4,
      value: 'reader',
      label: getLabel('reader'),
    });
  }

  roles.push({
    id: 1,
    value: 'contributor',
    label: getLabel('contributor'),
  });

  if (
    areModeratorsEnabled
    && (userCredential === 2 || (userCredential === 3 && modoCanInviteModo))
  ) {
    roles.push({
      id: 3,
      value: 'moderator',
      label: getLabel('moderator'),
    });
  }
  if (userCredential === 2) {
    roles.push({
      id: 2,
      value: 'administrator',
      label: getLabel('administrator'),
    });
  }

  return roles;
}

export default function getInviteSchema({
  getLabel,
  isAgendaPrivate = false,
  areModeratorsEnabled = false,
  isInvitationMessageEnabled = false,
  modoCanInviteModo = false,
  userCredential,
}) {
  const fields = [
    {
      fieldType: 'emails',
      field: 'emails',
      label: getLabel('emails'),
      placeholder: getLabel('inviteMembersPlaceholder'),
      optional: false,
      max: 3000,
    },
    {
      fieldType: 'select',
      field: 'role',
      label: getLabel('role'),
      default: 1,
      options: getRoleOptions({
        getLabel,
        isAgendaPrivate,
        areModeratorsEnabled,
        modoCanInviteModo,
        userCredential,
      }),
      optional: false,
    },
  ];

  if (isInvitationMessageEnabled) {
    fields.push({
      fieldType: 'markdown',
      field: 'message',
      label: getLabel('message'),
    });
  }

  return {
    custom: {
      emails: emailsValidator,
    },
    fields,
  };
}

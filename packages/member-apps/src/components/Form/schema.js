import labels from '@openagenda/labels/agenda-contribute/member';

export default {
  fields: [
    {
      field: 'organization',
      label: labels.organisation,
      fieldType: 'text',
      optional: false,
    },
    {
      field: 'phone',
      label: labels.phone,
      sub: labels.phoneSub,
      fieldType: 'phone',
      optional: false,
    },
    {
      field: 'name',
      label: labels.name,
      fieldType: 'text',
      optional: false,
    },
    {
      field: 'position',
      label: labels.position,
      fieldType: 'text',
      optional: false,
    },
    {
      field: 'email',
      label: labels.email,
      fieldType: 'email',
      optional: false,
    },
  ],
};

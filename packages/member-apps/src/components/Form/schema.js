import labels from '@openagenda/labels/agenda-contribute/member';

export default ({ optionalFields }) => ({
  fields: [
    {
      field: 'organization',
      label: labels.organisation,
      fieldType: 'text',
      optional: optionalFields ?? false,
    },
    {
      field: 'phone',
      label: labels.phone,
      sub: labels.phoneSub,
      fieldType: 'phone',
      optional: optionalFields ?? false,
    },
    {
      field: 'name',
      label: labels.name,
      fieldType: 'text',
      optional: optionalFields ?? false,
    },
    {
      field: 'position',
      label: labels.position,
      fieldType: 'text',
      optional: optionalFields ?? false,
    },
    {
      field: 'email',
      label: labels.email,
      fieldType: 'email',
      optional: optionalFields ?? false,
    },
  ],
});

'use strict';

const labels = require('@openagenda/labels/agenda-contribute/member');

module.exports = ({ optionalFields }) => ({
  fields: [
    {
      field: 'organization',
      label: labels.organisation,
      fieldType: 'text',
      optional: optionalFields ?? false,
      default: null,
    },
    {
      field: 'phone',
      label: labels.phone,
      sub: labels.phoneSub,
      fieldType: 'phone',
      optional: optionalFields ?? false,
      default: null,
    },
    {
      field: 'name',
      label: labels.name,
      fieldType: 'text',
      optional: optionalFields ?? false,
      default: null,
    },
    {
      field: 'position',
      label: labels.position,
      fieldType: 'text',
      optional: optionalFields ?? false,
      default: null,
    },
    {
      field: 'email',
      label: labels.email,
      fieldType: 'email',
      optional: optionalFields ?? false,
      default: null,
    },
  ],
});

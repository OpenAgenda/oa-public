"use strict";

const labels = require( '@openagenda/labels/agenda-contribute/member' );

export default {
  fields: [ {
    field: 'organization',
    label: labels.organisation,
    fieldType: 'text',
    optional: false
  }, {
    field: 'contactNumber',
    label: labels.phone,
    sub: labels.phoneSub,
    fieldType: 'phone',
    optional: false,
  }, {
    field: 'contactName',
    label: labels.name,
    fieldType: 'text',
    optional: false
  }, {
    field: 'contactPosition',
    label: labels.position,
    fieldType: 'text',
    optional: false
  }, {
    field: 'email',
    label: labels.email,
    fieldType: 'email',
    optional: false
  } ]
}

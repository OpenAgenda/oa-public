'use strict';

const labels = require('@openagenda/labels/agenda-contribute/member');

module.exports = agendaUid => {
  if (agendaUid === 49534310) { //colosapprenantes
    return {
      fields: [ {
        field: 'organization',
        label: 'Organisation et code de votre département',
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
    };
  }
  return null;
}

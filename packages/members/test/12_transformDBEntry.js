"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const {
  fromDB,
  toDB
} = require( '../lib/transformDBEntry' );

describe( 'members - unit - transformDBEntry', () => {

  it( 'toDB', () => {

    const entry = toDB( {
      userUid: 12,
      agendaUid: 31,
      role: 1,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        email: 'support@openagenda.com',
        contactPosition: 'Support'
      }
    } );

    entry.should.eql( {
      agenda_uid: 31,
      user_uid: 12,
      credential: 1,
      store: '{"custom_fields":{"organization":"OpenAgenda","contact_name":"Gaetan","contact_number":"01 23 45 67 89","contact_position":"Support","email":"support@openagenda.com"}}',
      organization: 'openagenda'
    } );

  } );

} );

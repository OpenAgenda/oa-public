"use strict";

const should = require( 'should' ),

format = require( '../service/format' );

describe( 'stakeholders service', () => {

  describe( 'format', () => {

    it( 'translate stakeholder object to db entry', () => {

      format.objToDb( {
        id: 12,
        agendaId: 123,
        userId: 456,
        credential: 2,
        createdAt: '2016-01-23 17:18:24',
        updatedAt: '2016-02-04 21:20:41',
        custom: {
          organization: {
            slug: 'drac-alpc',
            label: 'DRAC ALPC'
          },
          contactNumber: '05 57 95 01 84',
          contactName: 'DEYRES Joëlle',
          contactPosition: 'coordination régionale manifestations patrimoine'
        }
      } )

      .should.eql( {
        id: 12,
        review_id: 123,
        user_id: 456,
        credential: 2,
        store: '{\"custom_fields\":{\"organization\":{\"slug\":\"drac-alpc\",\"label\":\"DRAC ALPC\"},\"contact_number\":\"05 57 95 01 84\",\"contact_name\":\"DEYRES Joëlle\",\"contact_position\":\"coordination régionale manifestations patrimoine\"}}',
        'organization': 'drac-alpc',
        'created_at' : '2016-01-23 17:18:24',
        'updated_at' : '2016-02-04 21:20:41'
      } );

    } );

    it( 'translate db entry to stakeholder object', () => {

      format.dbToObj( {
        id: 12,
        review_id: 123,
        user_id: 456,
        credential: 2,
        store: '{"custom_fields":{"organization":"DRAC ALPC","contact_number":"05 57 95 01 84","contact_name":"DEYRES Jo\\u00eblle","contact_position":"coordination r\\u00e9gionale manifestations patrimoine"}}',
        'organization': 'drac-alpc',
        'created_at' : '2016-01-23 17:18:24',
        'updated_at' : '2016-02-04 21:20:41'
      } )

      .should.eql( {
        id: 12,
        agendaId: 123,
        userId: 456,
        credential: 2,
        createdAt: '2016-01-23 17:18:24',
        updatedAt: '2016-02-04 21:20:41',
        custom: {
          organization: {
            slug: 'drac-alpc',
            label: 'DRAC ALPC'
          },
          contactNumber: '05 57 95 01 84',
          contactName: 'DEYRES Joëlle',
          contactPosition: 'coordination régionale manifestations patrimoine'
        }
      } );

    } );

  } );

} );
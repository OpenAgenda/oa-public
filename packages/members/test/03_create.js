"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - create', () => {

  let k, svc;

   before( async () => {

    const con = mysql.createConnection( _.assign( _.pick( config.mysql, [ 'user', 'password' ] ), {
      multipleStatements: true
    } ) );

    const query = promisify( con.query.bind( con ) );

    const result = await query( fixtures );

    con.end();

  } );

   before( () => {

    k = knex( {
      client: 'mysql',
      connection: _.assign( {
        database: 'memberstest'
      }, config.mysql )
    } );

    svc = Service( {
      knex: k,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' )
      }
    } );

  } );

  after( () => {

    k.destroy();

  } );

  it( 'simple create creates', async () => {

    const { member } = await svc.create( {
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

    _.omit( member, [ 'createdAt', 'updatedAt' ] ).should.eql( {
      id: 5,
      agendaUid: 31,
      userUid: 12,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        contactPosition: 'Support',
        email: 'support@openagenda.com'
      },
      deletedUser: false,
      role: 1
    } );

  } );

  it( 'if member with same userUid and agendaUid already exists, error is thrown', async () => {

    let error = null;

    try {
      await svc.create( {
        userUid: 1,
        agendaUid: 1,
        role: 1
      }, { requireCustom: false } );
    } catch ( e ) {
      error = e;
    }

    error.message.should.equal( 'Already exists' );

  } );

  it( 'by default, custom data is required for create', async () => {

    const result = await svc.create( {
      userUid: 1,
      role: 2
    } );

    result.errors.length.should.equal( 5 );

  } );

  it( 'if requireCustom is false, custom data is optional', async () => {

    const result = await svc.create( {
      userUid: 1,
      role: 1
    }, { requireCustom: false } );

    result.errors.length.should.equal( 0 );

  } );


} );

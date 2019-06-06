"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - get', () => {

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

  describe( 'basic', () => {

    let member;

    before( async () => {

      member = await svc.get( { agendaUid: 1, userUid: 2 } );

    } );

    it( 'fetched member includes user and agenda uids', () => {

      _.pick( member, [ 'userUid', 'agendaUid' ] ).should.eql( {
        agendaUid: 1,
        userUid: 2
      } );

    } );

    it( 'fetched member includes role', () => {

      member.role.should.equal( 1 );

    } );

    it( 'by default, legacy fields are not provided', () => {

      should( member.credential ).equal( undefined );

    } );

  } );

} );

"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - list', () => {

  const f = fixtures( config.mysql );

  let k, svc;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getAgendasByUid: require( './fixtures/getAgendasByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' )
      }
    } );

  } );

  after( f.destroyClient );

  describe( 'basic', () => {

    let members;

    before( async () => {

      members = await svc.list( { agendaUid: 1 }, { limit: 1 } );

    } );

    it( 'length matches specified limit', () => {

      members.length.should.equal( 1 );

    } );

    it( 'provides a list in response', async () => {

      _.omit( members[ 0 ], [ 'createdAt', 'updatedAt' ] ).should.eql( {
        id: 1,
        order: 1,
        actionsCounter: 12,
        agendaUid: 1,
        userUid: 1,
        invited: false,
        role: 2,
        slug: 'janine',
        custom: {
          organization: 'Mairie de Saint-Germain-en-Laye',
          contactName: 'Janine Ponceau',
          contactNumber: '0130872171',
          contactPosition: 'Responsable de la diffusion artistique',
          email: 'janine@ponceau.fr'
        },
        deletedUser: false
      } );

    } );

    it( 'by default, user details are not provided', async () => {

      should( members[ 0 ].user ).equal( undefined );

    } );

  } );

  describe( 'pagination', () => {

    it( 'with "after" and "limit" keys', async () => {

      const query = { agendaUid: 1 };

      const first = await svc.list( query, { limit: 1 } );

      const second = await svc.list( query, { after: 1, limit: 1 } );

      first[ 0 ].id.should.equal( 1 );
      second[ 0 ].id.should.equal( 2 );

    } );

    it( 'with "offset" and "limit" keys', async () => {

      const second = await svc.list( { agendaUid: 1 }, { offset: 1, limit: 1 } );
      second[ 0 ].id.should.equal( 2 );

    } );

    it( 'with "page" and "limit" keys', async () => {

      const second = await svc.list( { agendaUid: 1 }, { page: 2, limit: 1 } );
      second[ 0 ].id.should.equal( 2 );

    } );

    it( 'use order key of previous result to fetch following values', async () => {

      const first = _.first( await svc.list( { agendaUid: 1 }, {
        order: 'slug.desc',
        limit: 1
      } ) );

      first.slug.should.equal( 'jean-claude' );

      const second = _.first( await svc.list( { agendaUid: 1 }, {
        order: 'slug.desc',
        limit: 1,
        after: [ 'jean-claude', 2 ]
      } ) );

      second.slug.should.equal( 'janine' );

    } );

  } );

  describe( 'legacy', () => {

    it( 'when legacy option is set to true, legacy values are provided', async () => {

      const { stakeholders } = await svc.list( { agendaUid: 1 }, { limit: 1 }, { legacy: true } );

      _.pick( stakeholders[ 0 ], [
        'agendaId',
        'credential',
        'userId',
        'actionsCounter'
      ] ).should.eql( {
        agendaId: 923,
        userId: 81289,
        credential: 2,
        actionsCounter: 12
      } );

    } );

    it( 'if organization is stored as slug/label, only label is given in listed result', async () => {

      const members = await svc.list( { agendaUid: 2 } );

      members[ 0 ].custom.organization.should.equal( 'OpenAgenda' );

    } );

    it( 'if query includes "credentials" value, it is interpreted as a "role" filter', async () => {

      const members = await svc.list( {
        agendaUid: 1,
        credentials: 'administrator'
      } );

      members[ 0 ].id.should.equal( 1 );

    } );

  } );

  describe( 'ordering', () => {

    it( 'default ordering is ascending id', async () => {

      const members = await svc.list( { agendaUid: 1 } );

      members.map( m => m.order ).should.eql( [ 1, 2, 4, 5 ] );

    } );

    it( 'ordering by descending id', async () => {

      const members = await svc.list( { agendaUid: 1 }, {
        order: 'id.desc'
      } );

      members.map( m => m.order ).should.eql( [ 5, 4, 2, 1 ] );

    } );

    it( 'ordering by ascending slug', async () => {

      const members = await svc.list( { agendaUid: 1 }, {
        order: 'slug.asc'
      } );

      members.map( m => m.order[ 0 ] ).should.eql( [ null, 'albertine', 'janine', 'jean-claude' ] );

    } );

    it( 'ordering by descending slug', async () => {

      const members = await svc.list( { agendaUid: 1 }, {
        order: 'slug.desc'
      } );

      members.map( m => m.order[ 0 ] ).should.eql( [ 'jean-claude', 'janine', 'albertine', null ] );

    } );

    it( 'ordering by descending actions', async () => {

      const { stakeholders } = await svc.list( { agendaUid: 1 }, {
        order: 'actionsCounter.desc'
      }, { legacy: true } );

      stakeholders.map( m => m.actionsCounter ).should.eql( [ 12, 5, 5, 0 ] );

    } );

    it( 'fix: ordering with after always sorts id asc', async () => {

      ( await svc.list( { agendaUid: 1 }, {
        limit: 2,
        order: 'actionsCounter.desc',
        after: [ 5, 2 ]
      } ) )[ 0 ].id.should.equal( 4 );

    } );

  } );

  describe( 'stream', () => {

    it( 'takes args as list but without pagination info', done => {

      // limit is not needed here, just for testing buffer refill
      const stream = svc.stream( { agendaUid: 1 }, { limit: 2, order: 'actionsCounter.asc' }, {
        transform: m => m.id
      } );

      const streamedMemberIds = [];

      stream.on( 'data', memberId => {

        streamedMemberIds.push( memberId );

      } );

      stream.on( 'end', () => {

        streamedMemberIds.should.eql( [ 5, 2, 4, 1 ] );

        done();

      } );

    } );

  } );

  describe( 'detailed', () => {

    let members;

    before( async () => {

      members = await svc.list( { agendaUid: 1 }, { limit: 2 }, { detailed: true } );

    } );

    it( 'when true, event count is provided', () => {

      members.map( m => m.eventCount ).should.eql( [ 12, 0 ] );

    } );

    it( 'when true, user details are provided in user sub key', () => {

      members[ 0 ].user.should.eql( {
        id: 10293,
        uid: 1,
        fullName: 'Janine Ponceau'
      } );

    } );

    it( 'when true, agenda details are provided in agenda sub key', () => {

      members[ 0 ].agenda.should.eql( {
        id: 10932,
        uid: 1,
        title: 'Les JEP'
      } );

    } );

  } );

  describe( 'other', () => {

    it( 'when withUser is false, only userless members are provided', async () => {

      const members = await svc.list( { agendaUid: 1, withUser: false } );

      members.length.should.equal( 1 );
      should( members[ 0 ].userUid ).equal( null );

    } );

    it( 'search looks in store field', async () => {

      const members = await svc.list( { agendaUid: 1, search: 'Janine' } );

      members[ 0 ].id.should.equal( 1 );
      members.length.should.equal( 1 );

    } );

    it( 'when total option is true, total is given in response', async () => {

      const {
        total,
        members
      } = await svc.list( { agendaUid: 1 }, { limit: 1 }, { total: true } );

      total.should.equal( 4 );

      members.length.should.equal( 1 );

    } );

    it( 'when deletedUser is null, members marked as associated with deleted user are included in results', async () => {

      const members = await svc.list( { agendaUid: 1, deletedUser: null } );

      members.filter( m => m.deletedUser === true ).length.should.equal( 1 );

    } );

    it( 'when deleteUserd is not provided, members marked as associated with deleted user are not in results', async () => {

      const members = await svc.list( { agendaUid: 1 } );

      members.filter( m => m.deletedUser === true ).length.should.equal( 0 );

    } );

    it( 'when deletedUser is true, only members marked as associated with deleted user are in results', async () => {

      const members = await svc.list( {
        agendaUid: 1,
        deletedUser: true
      } );

      members.length.should.equal( 1 )
      members[ 0 ].deletedUser.should.equal( true );

    } );

    it( 'when ids are given to list, matching members are provided', async () => {

      const members = await svc.list( { id: [ 3, 5 ] } );

      members.map( m => m.id ).should.eql( [ 3, 5 ] );

    } );

  } );

} );

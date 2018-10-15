import _ from 'lodash';
import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';
import OaSdk from '../src';
import testconfig from '../testconfig';

describe( 'connection', () => {
  it( 'simple connect', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    expect( oa.accessToken ).to.be.a( 'string' ).to.have.lengthOf( 32 );
  } );

  it( 'simple connect - key provided on connect', async () => {
    const oa = new OaSdk();
    await oa.connect( testconfig.secretKey );

    expect( oa.accessToken ).to.be.a( 'string' ).to.have.lengthOf( 32 );
  } );

  it( 'fail connection', async () => {
    const oa = new OaSdk();

    expect(
      oa.connect( 'inexistant' )
    ).to.be.rejectedWith( 'Bad Request' );
  } );
} );

describe( 'refresh expired token', () => {
  it( 'refresh token if needed', async () => {
    const oa = new OaSdk();

    const spy = sinon.spy( oa, 'connect' );

    await oa.connect( testconfig.secretKey );

    const clock = sinon.useFakeTimers( Date.now() );

    await oa.events.get( 12345678 );

    expect( spy.callCount ).to.be.equal( 1 );

    clock.tick( oa.expiresIn * 1000 );

    await oa.events.get( 12345678 );

    expect( spy.callCount ).to.be.equal( 2 );

    clock.restore();
  } );
} );

describe( 'locations', () => {
  it( 'create a location', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    const location = await oa.locations.create( testconfig.agendaUid, {
      name: 'Gare Meuse TGV',
      address: 'Lieu dit Le Cugnet, 55220 Les Trois-Domaines',
      latitude: 48.9736458,
      longitude: 5.2723537
    } );

    expect( location ).to.have.property( 'uid' ).that.is.a( 'number' );
  } );

  it( 'fails to create a location', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    try {
      await oa.locations.create( testconfig.agendaUid, {
        name: 'Gare Meuse TGV',
        address: 'Lieu dit Le Cugnet, 55220 Les Trois-Domaines'
      } );
    } catch ( e ) {
      expect( e.response.body ).to.be.eql( {
        error: 'invalid_request',
        error_description: 'latitude: Latitude is required, longitude: Longitude is required'
      } );
    }
  } );
} );

describe( 'events', () => {
  it( 'create & delete an event', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    const { success, event } = await oa.events.create( testconfig.agendaUid, {
      slug: 'a-title-' + _.random( Math.pow( 10, 6 ) ),
      title: {
        fr: 'Un titre',
        en: 'A title'
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc'
      },
      locationUid: 78372099,
      timings: [ {
        begin: moment(),
        end: moment().add( 1, 'hour' )
      }, {
        begin: moment().add( 1, 'day' ),
        end: moment().add( 1, 'day' ).add( 1, 'hour' )
      } ]
    } )
      .catch( ::console.log );

    expect( success ).to.equal( true );
    expect( event.uid ).to.be.a( 'number' );
    expect( event.title.fr ).to.be.equal( 'Un titre' );

    await oa.events.delete( testconfig.agendaUid, event.uid )
      .catch( ::console.log );
  } );

  it( 'create & delete an event - with keywords', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    const { success, event } = await oa.events.create( testconfig.agendaUid, {
      slug: 'a-title-' + _.random( Math.pow( 10, 6 ) ),
      title: {
        fr: 'Un titre',
        en: 'A title'
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc'
      },
      locationUid: 78372099,
      timings: [ {
        begin: moment(),
        end: moment().add( 1, 'hour' )
      }, {
        begin: moment().add( 1, 'day' ),
        end: moment().add( 1, 'day' ).add( 1, 'hour' )
      } ],
      keywords: {
        fr: [ 'Toulouse', 'Toulouse Centre', 'Culture', 'Exposition', 'Tout public' ]
      }
    } )
      .catch( ::console.log );

    expect( success ).to.equal( true );
    expect( event.uid ).to.be.a( 'number' );
    expect( event.title.fr ).to.be.equal( 'Un titre' );

    await oa.events.delete( testconfig.agendaUid, event.uid )
      .catch( ::console.log );
  } );

  it( 'fails to create an event', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    try {
      await oa.events.create( testconfig.agendaUid, {
        slug: 'a-title-' + _.random( Math.pow( 10, 6 ) ),
        description: {
          fr: 'On va faire un truc',
          en: 'We make a truc'
        },
        locationUid: 78372099,
        timings: [ {
          begin: moment(),
          end: moment().add( 1, 'hour' )
        }, {
          begin: moment().add( 1, 'day' ),
          end: moment().add( 1, 'day' ).add( 1, 'hour' )
        } ]
      } );
    } catch ( e ) {
      expect( e.response.body ).to.be.eql( {
        errors: [ {
          field: 'title',
          code: 'required',
          message: 'at least one language entry is required'
        } ]
      } );
    }
  } );

  it( 'get an event', async () => {
    const oa = new OaSdk( {
      publicKey: testconfig.publicKey,
      secretKey: testconfig.secretKey
    } );

    await oa.connect();

    const { event: createdEvent } = await oa.events.create( testconfig.agendaUid, {
      slug: 'a-title-' + _.random( Math.pow( 10, 6 ) ),
      title: {
        fr: 'Un titre',
        en: 'A title'
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc'
      },
      locationUid: 78372099,
      timings: [ {
        begin: moment(),
        end: moment().add( 1, 'hour' )
      }, {
        begin: moment().add( 1, 'day' ),
        end: moment().add( 1, 'day' ).add( 1, 'hour' )
      } ]
    } )
      .catch( ::console.log );

    const event = await oa.events.get( createdEvent.uid );

    expect( parseInt( event.uid, 10 ) ).to.be.equal( createdEvent.uid );

    await oa.events.delete( testconfig.agendaUid, createdEvent.uid )
      .catch( ::console.log );
  } );

  it( 'update an event', async () => {
    const oa = new OaSdk( { secretKey: testconfig.secretKey } );
    await oa.connect();

    const { success, event } = await oa.events.create( testconfig.agendaUid, {
      slug: 'a-title-' + _.random( Math.pow( 10, 6 ) ),
      title: {
        fr: 'Un titre',
        en: 'A title'
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc'
      },
      locationUid: 78372099,
      timings: [ {
        begin: moment(),
        end: moment().add( 1, 'hour' )
      }, {
        begin: moment().add( 1, 'day' ),
        end: moment().add( 1, 'day' ).add( 1, 'hour' )
      } ]
    } )
      .catch( ::console.log );

    const { event: updatedEvent } = await oa.events.update( testconfig.agendaUid, event.uid, {
      slug: event.slug,
      title: {
        fr: 'Titre mise à jour',
        en: 'Updated title'
      },
      timings: event.timings
    } )
      .catch( ::console.log );

    expect( success ).to.equal( true );
    expect( event.uid ).to.be.a( 'number' );
    expect( event.title.fr ).to.be.equal( 'Un titre' );
    expect( updatedEvent.title.fr ).to.be.equal( 'Titre mise à jour' );

    await oa.events.delete( testconfig.agendaUid, event.uid )
      .catch( ::console.log );
  } );
} );

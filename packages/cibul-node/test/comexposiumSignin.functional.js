"use strict";

var t = require( './lib/lib' ),

should = require( 'should' ),

config = require( '../config' );

describe( 'agenda comexposium signin', function() {

  this.timeout( 10000 );

  var browser,

  agenda = {},

  ownerId, userId,

  user = {
    email: 'gaetan@cibul.net',
    comexposiumId: 'latoucheman',
    store: {
      comex: {
        password: 'yeepeekayyeay'
      }
    }
  };

  before( function( done ) {

    t.boot( true, done );

  });

  after( t.shutdown );

  beforeEach( t.fixtures.clearAll );

  beforeEach( ( done ) => {

    t.loadBrowser( ( err, b ) => {

      browser = b;

      done();

    });

  });

  beforeEach( done => {

    t.model.lib.query( 'insert into user ( uid, email, comexposium_id, store ) values ( ?, ?, ?, ? )', [
      12345678,
      user.email,
      user.comexposiumId,
      JSON.stringify( user.store )
    ], ( err, result ) => {

      userId = result.insertId;

      done();

    } );

  });

  beforeEach( done => {

    t.model.lib.query( 'insert into user ( email ) values ( ? )', [ 'cow@boy.com' ], ( err, result ) => {

      ownerId = result.insertId;

      done();

    });

  });

  beforeEach( done => {

    t.model.lib.query( 'insert into review ( uid, title, owner_id ) values ( ?, ?, ? )', [
      config.comexposium.contributingAgendaUid,
      'Agenda test comexposium',
      ownerId
    ], ( err ) => {

      done();

    });

  });


  it( 'signin via comexposium link', done => {

    browser.visit( '/comex/signin?login=' + user.comexposiumId + '&password=' + user.store.comex.password )

    .then( null, () => {

      browser.location.pathname.should.equal( '/frontend_test.php/home' );

      done();

    });

  });

  it( 'signed in user is contributor of configured agenda', done => {

    browser.visit( '/comex/signin?login=' + user.comexposiumId + '&password=' + user.store.comex.password )

    .then( null, () => {

      t.model.lib.query( 'select user_id, r.uid from reviewer as rr left join review as r on r.id=rr.review_id where r.uid = ?', config.comexposium.contributingAgendaUid, ( err, rows ) => {

        rows[ 0 ].user_id.should.equal( userId );

        done();

      } );

    } );

  });

} );
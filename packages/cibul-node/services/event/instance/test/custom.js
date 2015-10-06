"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/event/instance/custom, services/image, services/file/s3' );

var cbm = require( '../../../model' ),

https = require( 'https' ),

s3Svc = require( '../../../file/s3' ),

should = require( 'should' ),

config = require( '../../../../config' ),

fixtureSets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

agendaSvc = require( '../../../agenda' ),

eventSvc = require( '../../../event' ),

fs = require( 'fs' );

describe( 'event service instance - custom', function() {

  this.timeout( 10000 );

  var agenda = {}, event;

  before( fixtureSets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  beforeEach( ( done ) => {

    var stream = fs.createReadStream( __dirname + '/testdata/bunny.png' );

    stream.pipe( fs.createWriteStream( __dirname + '/testdata/source.png' ) );

    stream.on( 'end', done );

  } );

  before( ( done ) => {

    // better to load config of image field here.
    cbm.lib.update( 'reviews', { id: agenda.id }, { store: JSON.stringify({
      customFields: [ {
        name: 'yourface',
        type: 'public',
        fieldType: 'image',
        label: {
          fr : 'Ta sale tête',
          en : 'Your ugly face'
        },
        crop: true,
        width: 300,
        height: 300
      } ]
    }) }, done );

  } );

  // reload after custom field update

  before( ( done ) => {

    agendaSvc.get( { id: agenda.id }, ( err, a ) => {

      agenda = a; 

      done();

    });

  } );

  // get the event
  
  before( ( done ) => {

    eventSvc.get( {}, ( err, e ) => {

      event = e;

      done();

    } );

  } );

  it( 'new event custom image loads in temporary store', ( done ) => {

    var aInst = agendaSvc.instanciate( agenda ),

    newEvent = aInst.events.new();

    newEvent.loadAgendaCustomContext( {
      uid: aInst.uid,
      customFields: aInst.getCustomFieldsConfig()
    });

    newEvent.setCustomImage( {
      name: 'yourface',
      path: __dirname + '/testdata/source.png',
      userUid: 123
    }, ( err, destUrl ) => {

      should( err ).equal( null );

      ( new RegExp( '\\/' + config.aws.tmpBucket + '\\.s3' ) ).test( destUrl ).should.equal( true );

      https.get( destUrl, function( res ) {

        res.statusCode.should.equal( 200 );
        
        res.headers[ 'content-type' ].should.equal( 'image/jpeg' );

        s3Svc.remove( destUrl.split( '/' ).pop(), { bucket: config.aws.tmpBucket }, function( err ) {

          should( err ).equal( null );

          done();

        });

      });

    });

  } );

  it( 'existing event custom image loads in permanent image store', ( done ) => {

    event.loadAgendaCustomContext( {
      uid: agenda.uid,
      customFields: agenda.getCustomFieldsConfig()
    });

    event.setCustomImage( {
      name: 'yourface',
      path: __dirname + '/testdata/source.png',
    }, ( err, destUrl ) => {

      ( new RegExp( '\\/' + config.aws.bucket + '\\.s3' ) ).test( destUrl ).should.equal( true );

      should( err ).equal( null );

      https.get( destUrl, function( res ) {

        res.statusCode.should.equal( 200 );
        
        res.headers[ 'content-type' ].should.equal( 'image/jpeg' );

        s3Svc.remove( destUrl.split( '/' ).pop(), { bucket: config.aws.bucket }, function( err ) {

          should( err ).equal( null );

          done();

        } );

      });

    } );

  } );


  it( 'existing new event custom image is transfered from temporary store to permanent', ( done ) => {

    var aInst = agendaSvc.instanciate( agenda ),

    newEvent = aInst.events.new();

    newEvent.loadAgendaCustomContext( {
      uid: aInst.uid,
      customFields: aInst.getCustomFieldsConfig()
    });

    newEvent.setCustomImage( {
      name: 'yourface',
      path: __dirname + '/testdata/source.png',
      userUid: 123
    }, ( err, destUrl ) => {

      // expecting that to work as per test 1
      
      // assuming this is the freshly created event
      event.loadAgendaCustomContext( {
        uid: agenda.uid,
        customFields: agenda.getCustomFieldsConfig()
      });

      event.saveCustomImage( {
        name: 'yourface',
        userUid: 123
      }, ( err, destUrl ) => {

        should( err ).equal( null );

        https.get( destUrl, function( res ) {

          res.statusCode.should.equal( 200 );

          cbm.lib.query( 'select custom_fields from event where id=?', event.id, ( err, rows ) => {

            JSON.parse( rows[ 0 ].custom_fields ).yourface.should.equal( agenda.uid + '.' + event.uid + '.yourface.jpg' );

            s3Svc.remove( destUrl.split( '/' ).pop(), { bucket: config.aws.bucket }, function( err ) {

              should( err ).equal( null );

              done();

            } );

          });

        } );

      });

    } );

  });


  it( 'event image of existing event is removed from store', ( done ) => {

    event.loadAgendaCustomContext( {
      uid: agenda.uid,
      customFields: agenda.getCustomFieldsConfig()
    });

    event.setCustomImage( {
      name: 'yourface',
      path: __dirname + '/testdata/source.png',
    }, ( err, destUrl ) => {

      event.unsetCustomImage( {
        name: 'yourface'
      }, ( err ) => {

        https.get( destUrl, function( res ) {

          res.statusCode.should.equal( 403 );
          
          done();        

        });

      });

    } );

  });


  it( 'event image of new event is removed from store', ( done ) => {

    var aInst = agendaSvc.instanciate( agenda ),

    newEvent = aInst.events.new();

    newEvent.loadAgendaCustomContext( {
      uid: aInst.uid,
      customFields: aInst.getCustomFieldsConfig()
    });

    newEvent.setCustomImage( {
      name: 'yourface',
      path: __dirname + '/testdata/source.png',
      userUid: 123
    }, ( err, destUrl ) => {

      newEvent.unsetCustomImage( {
        name: 'yourface',
        userUid: 123
      }, ( err ) => {

        should( err ).equal( null );

        https.get( destUrl, function( res ) {

          res.statusCode.should.equal( 403 );
          
          done();        

        });

      });

    } );

  } );

} )
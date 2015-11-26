"use strict";

process.env.NODE_ENV = 'test';

var oembedSvc = require( '../oembed' ),

cbm = require( '../../model' ),

should = require( 'should' ),

fixtureSets = require( 'cibulModel/test/fixtures/sets' )( cbm );

describe( 'oembed service', function() {

  this.timeout( 20000 );

  var eInst = {};

  before( fixtureSets.prepareOneEventInstance( eInst, 'evenement-multimedia' ) );

  it( 'oembed codes are retrieved', function( done ) {

    oembedSvc.process( { id: eInst.id }, function( err ) {

      // need to reload instance from db data
      cbm.events().get( { id: eInst.id }, function( err, event ) {

        var links = cbm.events().instance( event ).getLinks();

        links[ 0 ].link.should.equal( 'https://www.youtube.com/watch?v=8oVTXSntnA0' );

        links[ 0 ].code.replace(/&#x26;/g, '&amp;').should.equal( '<div style=\"left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 75.0019%;\"><iframe src=\"https://www.youtube.com/embed/8oVTXSntnA0?wmode=transparent&amp;rel=0&amp;autohide=1&amp;showinfo=0&amp;enablejsapi=1\" frameborder=\"0\" allowfullscreen=\"true\" webkitallowfullscreen=\"true\" mozallowfullscreen=\"true\" style=\"top: 0px; left: 0px; width: 100%; height: 100%; position: absolute;\"></iframe></div>' );

        links[ 1 ].link.should.equal( 'https://soundcloud.com/relaxdaily/forest-soundtrack' );

        links[ 1 ].code.replace(/&#x26;/g, '&amp;').should.equal( '<div style="left: 0px; width: 100%; height: 400px; position: relative;"><iframe src="https://w.soundcloud.com/player/?visual=true&amp;url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F164660733&amp;show_artwork=true" frameborder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" style="top: 0px; left: 0px; width: 100%; height: 100%; position: absolute;"></iframe></div>' );

        done();

      });

    } );

  });

});
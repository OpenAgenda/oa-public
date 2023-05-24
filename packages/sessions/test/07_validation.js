"use strict";

const should = require( 'should' );
const validate = require( '../src/service/validate' );

describe( 'session - unit (server): validate', () => {

  it( 'server validate function describes data kept for session on server side', () => {

    let sessionData = {
      id: 1,
      uid: 12345678,
      email: 'gaetan.latouche@cibul.net',
      expires: undefined,
      culture: 'fr',
      name: 'Gaetan Latouche',
      thumbnail: '//graph.facebook.com/100002280111541/picture',
      latestActivity: new Date( '1981-02-28T03:00:00+0100' ),
      isNew: false,
      isBlacklisted: false,
    };

    validate( sessionData ).should.eql( sessionData );

  } );

} );
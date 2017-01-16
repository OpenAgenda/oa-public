"use strict";

const should = require( 'should' );
const validate = require( '../service/validate' );

describe( 'session - unit (server): validate', () => {

  it( 'server validate function describes data kept for session on server side', () => {

    let sessionData = {
      code: 'sessioncookiecode',
      id: 1,
      uid: 12345678,
      email: 'gaetan.latouche@cibul.net',
      culture: 'fr',
      name: 'Gaetan Latouche',
      thumbnail: '//graph.facebook.com/100002280111541/picture',
      latestActivity: new Date( '1981-02-28T03:00:00+0100' )
    };

    validate( sessionData ).should.eql( sessionData );

  } );

} );
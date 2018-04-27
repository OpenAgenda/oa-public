"use strict";

const { promisify } = require( 'util' );
const { expect } = require( 'chai' );
const usersSvc = require( '../' );
const mw = require( '../middleware' );
const testconfig = require( '../testconfig' );


describe( 'load', () => {

  it( 'load a user from his uid', async () => {

    usersSvc.init( testconfig );

    const req = { user: { uid: 75052324 } };

    await promisify( mw.load() )( req, {} );

    expect( req.user.fullName ).to.be.equal( 'Kari Olafsson' );

    await usersSvc().knex.destroy();

  } );

  it( 'load a user from his id', async () => {

    usersSvc.init( testconfig );

    const req = { user: { id: 2 } };

    await promisify( mw.load() )( req, {} );

    expect( req.user.fullName ).to.be.equal( 'Romain Lange - OpenAgenda' );

    await usersSvc().knex.destroy();

  } );

  it( 'throws an error when neither the id nor the uid is provided', async () => {

    usersSvc.init( testconfig );

    await expect(
      promisify( mw.load() )( {}, {} )
    ).to.be.rejected;

    await usersSvc().knex.destroy();

  } );

} );

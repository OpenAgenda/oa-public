"use strict";

const _ = require( 'lodash' );
const newsletter = require( '../index.js' );

const config = {
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  contactsListsListId: process.env.CONTACTS_LIST_ID,
};


describe( 'Add user', () => {
  beforeAll( () => {
    newsletter.init( _.merge( config, { mailjet: { performApiCall: false } } ) );
  } );

  it.only( 'add to list - success', async () => {
    const result = await newsletter.addSubscriber( 'kevin.bertho@gmail.com' );

    expect(result.body.Total).toBe(1);
    expect(result.body.Data[ 0 ].Email).toBe('kevin.bertho@gmail.com');
  } );

  it( 'add to list - fail', async () => {
    let error;

    try {
      const result = await newsletter.addSubscriber( /* missing email */ );
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe('Unsuccessful');
  });
});
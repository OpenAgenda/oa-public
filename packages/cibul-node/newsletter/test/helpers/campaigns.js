process.env.NODE_ENV = 'test';

var config = require('../../../config'),

cmn = require( '../../../lib/commons-task' ),

model = cmn.getCibulModel(),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( model ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../../../lib/lib' ),

log = require( 'debug' )( 'campaigns helper' );



/**
 * make a user, give him a review, a campaign,
 * a contact list and a bunch of contacts
 * schedule the campaign for now
 */

exports.prepare = function( options, cb ) {

  var user, review, campaign, contactList,

  params = lib.extend( {
    emails: [ 'poney@cibul.net', 'bisounours@cibul.net', 'cali@cibul.net' ]
  }, options );
   
  wn.call( fixtures.clearAll )

  .then( function() {

    log( 'loading gaetan' );

    return wn.call( fixtures.load, 'users', 'gaetan' );

  } )

  .then( function( u ) {

    user = u;

    return wn.call( fixtures.load, 'reviews', 'chez-nous', { ownerId: user.id });

  })

  .then( function( r ) {

    review = model.reviews().instance( r );

    return wn.call( review.campaigns.create, {
      title: 'whatever'
    });

  })

  .then( function( c ) {

    campaign = model.campaigns().instance( c );

    return wn.call( review.contactLists.create, { title: 'who cares' } )

  })

  .then( function( ct ) {

    contactList = model.contactLists().instance( ct );

    return wn.call( campaign.setContactList, contactList );

  })

  .done( function() {

    async.each( params.emails , function( email, ecb ) {

      contactList.contacts.create({ email: email }, ecb );

    }, function( err ) {

      if ( err ) return log( err );

      campaign.setScheduledAt( new Date(), true, cb );

    })

  });

}
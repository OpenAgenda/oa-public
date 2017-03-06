"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const mail = require( '../mail' );

describe( 'notification - mail', function() {

  it( 'basic test', done => {

    mail( [ {
      id: 5768489,
      type: 11,
      user_id: 28336,
      event_id: null,
      object: null,                                   
      owner_id: 2,
      review_id: 3868
    } ], ( err, data ) => {

      console.log( data );

      done();

    } );

  } );

} );


/*

[ {
  id: 5768489,
  type: 11,
  user_id: 28336,
  event_id: NULL,
  object: NULL,                                   
  ower_id: 2,
  review_id: 3868
}, {
  id: 5768490,
  type: 32,
  user_id: 9236,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768491,
  type: 32,
  user_id: 5579,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768492,
  type: 32,
  user_id: 26399,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768493,
  type: 32,
  user_id: 11388,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768494,
  type: 32,
  user_id: 5803,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768495,
  type: 32,
  user_id: 5565,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768496,
  type: 32,
  user_id: 9281,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768497,
  type: 32,
  user_id: 1,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768498,
  type: 32,
  user_id: 26398,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768499,
  type: 32,
  user_id: 6243,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768500,
  type: 32,
  user_id: 5581,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768501,
  type: 32,
  user_id: 24446,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768502,
  type: 32,
  user_id: 17224,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768503,
  type: 32,
  user_id: 5863,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768504,
  type: 32,
  user_id: 2,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768505,
  type: 32,
  user_id: 23198,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768506,
  type: 32,
  user_id: 5363,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768507,
  type: 32,
  user_id: 5951,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768508,
  type: 32,
  user_id: 17576,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768509,
  type: 32,
  user_id: 4499,
  event_id: 149956,
  object: NULL,                                   
  ower_id: 28336,
  review_id: 3868
}, {
  id: 5768510,
  type: 34,
  user_id: 1732,
  event_id: 149170,
  object: NULL,                                   
  ower_id: 1732,
  review_id: 2175
}, {
  id: 5768511,
  type: 11,
  user_id: 28338,
  event_id: NULL,
  object: NULL,                                   
  ower_id: 9947,
  review_id: 5139
}, {
  id: 5768513,
  type: 32,
  user_id: 9947,
  event_id: 149957,
  object: NULL,                                   
  ower_id: 28338,
  review_id: 5139
}, {
  id: 5768512,
  type: 20,
  user_id: 28304,
  object: 'a:1:{s:20:"aggregator_source_id";s:4:"2307";}',
  review_id: 7412
} ]*/
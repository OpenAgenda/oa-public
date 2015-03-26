"use strict";

var parser = require( '../parser' ),

should = require( 'should' );

describe( 'simple parser', function() {

  var p = parser( {
    attributes: [
      { name: 'Title', mapTo: 'title' },
      { name: 'Description', mapTo: 'description' }
    ]
  });

  it( 'successful template load', function() {

    p.load( '<div>{Title}</div>' );

    p.render( { title: 'Yeay!' } )

    .should.equal( '<div>Yeay!</div>' );

  } );

  it( 'ignoring an irrelevant variable', function() {

    p.load( '<div>{Title}</div>{ignorethis}' );

    p.render( { title: 'Yeay!' } )

    .should.equal( '<div>Yeay!</div>' );

  });

  it( 'render with a conditional attribute block', function() {

    p.load( [
      '<div>{Title}</div>',
      '{block:Ignore}ignored{/block:Ignore}',
      '{block:Description}',
        '<div>{Description}</div>',
      '{/block:Description}'
    ].join( '' ));

    p.render( { title: 'Yeay!' } )

    .should.equal( '<div>Yeay!</div>ignored' );

    p.render( { 
      title: 'Yeay!', 
      description: 'Woopidoo'
    } )

    .should.equal( '<div>Yeay!</div>ignored<div>Woopidoo</div>' )

    // with and without

  } );

} );


describe( 'parser with children', function() {

  var p = parser( {
    attributes: [
      { name: 'Title', mapTo: 'title' },
      { name: 'Description', mapTo: 'description' }
    ],
    children: [{ 
      name: 'Child', 
      mapTo: 'child',
      attributes: [
        { name: 'Name', mapTo: 'name' },
        { name: 'Surname', mapTo: 'surname' }
      ]
    }]
  });



});

/*
p = parser( {
  attributes: [ {
    { name: 'Title', mapTo: 'title' },
    { name: 'Description', mapTo: 'description' }
  } ],
  children: [{ 
    name: 'Event', 
    mapTo: 'events'
    // this is recursively processed
    attributes: [
      { name: 'Title', mapTo: 'title' },
      { name: 'Description', mapTo: 'description' },
      { name: 'FreeText', mapTo: 'freeText' }
    ]
  }]
} );

p.load( 'the template' );

p.render( { the data }); */
"use strict";

var parser = require( '../parser' ),

should = require( 'should' );

describe( 'simple parser', function() {

  var p = parser( {
    attributes: [
      { name: 'Title', mapTo: 'title' },
      { name: 'Description', mapTo: 'description' },
      { name: 'Image', mapTo: 'image' }
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

  it( 'rendering the same element multiple times', function() {

    p.load( '<div>{Title}</div> Ladida <p>{Title}</p>');

    p.render( { title: 'Yeay?' } )

    .should.equal( '<div>Yeay?</div> Ladida <p>Yeay?</p>' );

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

  
  it( 'render the same conditional attribute block multiple times', function() {

    p.load( [
      '<div>{Title}</div>',
      '{block:Ignore}ignored{/block:Ignore}',
      '{block:Description}',
        '<div>{Description}</div>',
      '{/block:Description}',
      ' something else here ',
      '{block:Description}',
        '<p>{Description}</p>',
      '{/block:Description}',
    ].join( '' ));

    p.render( {
      title: 'Shakalaka',
      description: 'boom'
    } ).should.equal( '<div>Shakalaka</div>ignored<div>boom</div> something else here <p>boom</p>' );

  } );


  it( 'null, undefined, false all count as false in a conditional statement', function() {

    p.load( [
      '<div>three falses</div>',
      '{block:Title}',
        '<h1>{Title}</h1>',
      '{/block:Title}',
      '-',
      '{block:Description}',
        '<p>{Description}</p>',
      '{/block:Description}',
      '-',
      '{block:Image}',
        '<img src="{Image}"/>',
      '{/block:Image}',
    ].join( '' ) );

    p.render( {
      Title: false,
      Description: undefined,
      Image: null
    }).should.equal( '<div>three falses</div>--' );

  } );

} );


describe( 'parser with children', function() {

  var p = parser( {
    name: 'Top',
    attributes: [
      { name: 'Title', mapTo: 'title' },
      { name: 'Description', mapTo: 'description' }
    ],
    children: [{ 
      name: 'Posts', 
      mapTo: 'posts',
      attributes: [
        { name: 'Title', mapTo: 'title' },
        { name: 'Author', mapTo: 'author' },
        { name: 'Content', mapTo: 'content' }
      ]
    }]
  });

  it( 'should populate children properly', function() {

    p.load( [
      '<h1>{Title}</h1>',
      '<p>{Description}</p>',
      '{block:Posts}',
        '<h2>{Title}</h2>',
        '<span>{Author}</span>',
        '<p>{Content}</p>',
      '{/block:Posts}' ].join( '' )
    );

    p.render({
      title: 'Un titre de blog',
      description: 'La description du blog',
      posts: [{
        title: 'Le premier article',
        author: 'Moi',
        content: 'Bla bla blaargh.'
      }, {
        title: 'Le deuxième article',
        author: 'Billy Bob Boy',
        content: 'Blaargh'
      }]
    })

    .should.equal( '<h1>Un titre de blog</h1><p>La description du blog</p><h2>Le premier article</h2><span>Moi</span><p>Bla bla blaargh.</p><h2>Le deuxième article</h2><span>Billy Bob Boy</span><p>Blaargh</p>' );

  });


});


describe( 'something', function( ) {

  var p = parser( {
    attributes : [
      { name: 'Title', mapTo: 'title' }
    ]
  });

  p.load( '<h1>{Title}</h1>' );

  // this test should check when strcuture has children
  // but no children are listed in template
  // this right now does not work

} );
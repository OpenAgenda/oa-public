const config = require( '../testconfig' );
const should = require( 'should' );
const fixtures = require( 'fixtures' );
const homeService = require( '../service' );
const agendasService = require( '../service/agendas' )( 2 );

describe( 'homeService agendas', function () {

  this.timeout( 20000 );


  describe( 'clean arguments for list', () => {

    it( 'clean arguments for list - without query', done => {

      const args = agendasService.tests._cleanListArguments( 1254, 10, 20, { option: 'test' }, () => {
      } );

      args.query.should.be.eql( {} );
      args.options.should.be.eql( { option: 'test' } );
      args.cb.should.be.type( 'function' );

      done();

    } );

    it( 'clean arguments for list - without options', done => {

      const args = agendasService.tests._cleanListArguments( 1254, { query: 'test' }, 10, 20, () => {
      } );

      args.query.should.be.eql( { query: 'test' } );
      args.options.should.be.eql( {} );
      args.cb.should.be.type( 'function' );

      done();

    } );

    it( 'clean arguments for list - without query and options', done => {

      const args = agendasService.tests._cleanListArguments( 1254, 10, 20, () => {
      } );

      args.query.should.be.eql( {} );
      args.options.should.be.eql( {} );
      args.cb.should.be.type( 'function' );

      done();

    } );

  } );


  describe( 'list', () => {

    before( done => {

      fixtures.init( config );

      fixtures( [ {
        table: 'review',
        src: __dirname + '/fixtures/review.sql'
      }, {
        table: 'reviewer',
        src: __dirname + '/fixtures/reviewer.sql'
      } ], done );

    } );

    before( done => {

      homeService.init( config, done );

    } );

    it( 'list', done => {

      homeService( 2 ).agendas.list( 5, 20, ( err, agendas ) => {

        should( err ).equal( null );
        should( agendas.length ).equal( 20 );

        done();

      } );

    } );

    it( 'list - with search', done => {

      homeService( 2 ).agendas.list( { search: 'agenda' }, 1, 20, ( err, agendas ) => {

        should( err ).equal( null );
        should( agendas.length ).equal( 2 );
        should( agendas[ 0 ] ).eql( {
          title: 'AGENDA ECONUM',
          slug: 'agenda-econum',
          image: 'review_agenda-econum_00.jpg',
          created_at: new Date( '2015-11-06 10:40:10.000 +0100' ),
          updated_at: new Date( '2016-06-22 17:50:28.000 +0200' )
        } );

        done();

      } );

    } );

    it( 'list - with total', done => {

      homeService( 2 ).agendas.list( 5, 20, { total: true }, ( err, agendas, total ) => {

        should( err ).equal( null );
        should( agendas.length ).equal( 20 );
        should( total ).equal( 26 );

        done();

      } );

    } );

    it( 'list - with search and total', done => {

      homeService( 2 ).agendas.list( { search: 'agenda' }, 0, 20, { total: true }, ( err, agendas, total ) => {

        should( err ).equal( null );
        should( agendas.length ).equal( 3 );
        should( agendas[ 0 ] ).eql( {
          title: 'L\'Agenda des Entrepreneurs',
          slug: 'agendapro',
          image: null,
          created_at: new Date( '2016-01-27 17:07:17.000 +0100' ),
          updated_at: new Date( '2016-06-23 12:17:41.000 +0200' )
        } );
        should( total ).equal( 3 );

        done();

      } );

    } );

    it( 'list with promise', done => {

      homeService( 2 ).agendas.list( { search: 'agenda' }, 0, 20, { total: true } )
        .then( ( { reviews, total } ) => {

          should( reviews.length ).equal( 3 );
          should( reviews[ 0 ] ).eql( {
            title: 'L\'Agenda des Entrepreneurs',
            slug: 'agendapro',
            image: null,
            created_at: new Date( '2016-01-27 17:07:17.000 +0100' ),
            updated_at: new Date( '2016-06-23 12:17:41.000 +0200' )
          } );
          should( total ).equal( 3 );

          done();

        } )
        .catch( done );

    } );

  } );

} );

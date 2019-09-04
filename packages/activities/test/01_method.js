"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const async = require( 'async' );
const method = require( '../src/utils/method' );

describe( 'method', function () {

  this.timeout( 2000 );

  describe( 'handleHook', () => {

    it( 'handleHook - call before function', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const step = {
        field,
        before: ( f, fs, h, next ) => {
          next();
        }
      };

      const _hooks = method.handleHook( 'before', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).equal( null );
        h.should.eql( hook );

        done();

      } );

    } );

    it( 'handleHook - modify field in a hook (before)', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const step = {
        field,
        before: ( f, fs, h, next ) => {

          f.morue = '...';

          f.should.eql( Object.assign( {}, field, { morue: '...' } ) );
          fs.should.eql( [ field ] );
          h.should.eql( hook );

          next();

        }
      };

      const _hooks = method.handleHook( 'before', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).equal( null );
        h.fields[ 0 ].morue.should.equal( '...' );
        h.should.eql( hook );

        done();

      } );

    } );

    it( 'handleHook - modify an other field in a hook (after)', done => {

      const field1 = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const field2 = {
        name: 'entity_uid',
        table: 'feed',
        dataKey: 'entityUid'
      };
      const fields = [ _.clone( field1 ), _.clone( field2 ) ];
      const hook = {
        result: null,
        error: null,
        fields,
        data: {}
      };
      const step = {
        field1,
        after: ( f, fs, h, next ) => {

          f.morue = '...';
          fs[ 1 ].yeah = 'hmm';

          f.should.eql( Object.assign( {}, field1, { morue: '...' } ) );
          fs.should.eql( [ field1, Object.assign( {}, field2, { yeah: 'hmm' } ) ] );
          h.should.eql( hook );

          next();

        }
      };

      const _hooks = method.handleHook( 'after', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).equal( null );
        h.fields[ 0 ].morue.should.equal( '...' );
        h.fields[ 1 ].yeah.should.equal( 'hmm' );
        h.should.eql( hook );

        done();

      } );

    } );

    it( 'handleHook - modify hook object in before hook', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const step = {
        field,
        before: ( f, fs, h, next ) => {

          h.blabla = 'jsaispo';

          next();

        }
      };

      const _hooks = method.handleHook( 'before', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).equal( null );
        h.blabla.should.equal( 'jsaispo' );
        h.should.eql( hook );

        done();

      } );

    } );

    it( 'handleHook - call all before functions of an array', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const step = {
        field,
        before: [
          ( f, fs, h, next ) => {

            f.morue = '...';

            f.should.eql( Object.assign( {}, field, { morue: '...' } ) );
            fs.should.eql( [ field ] );
            h.should.eql( hook );

            next();

          }, ( f, fs, h, next ) => {

            f.bofProperty = 'mabite';

            f.should.eql( Object.assign( {}, field, { morue: '...', bofProperty: 'mabite' } ) );
            fs.should.eql( [ Object.assign( {}, field, { morue: '...' } ) ] );
            h.should.eql( hook );

            next();

          }
        ]
      };

      const _hooks = method.handleHook( 'before', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).equal( null );
        h.fields[ 0 ].morue.should.equal( '...' );
        h.fields[ 0 ].bofProperty.should.equal( 'mabite' );
        h.should.eql( hook );

        done();

      } );

    } );

    it( 'handleHook - throw error in a before function', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const step = {
        field,
        before: [
          ( f, fs, h, next ) => {

            f.morue = '...';

            next();

          }, ( f, fs, h, next ) => {

            f.bofProperty = 'mabite';

            next( new Error( 'the error' ) );

          }
        ]
      };

      const _hooks = method.handleHook( 'before', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).not.equal( null );
        should( err ).eql( _.merge( {}, hook, { error: new Error( 'the error' ) } ) );
        should( h ).equal( undefined );
        err.fields[ 0 ].should.eql( Object.assign( {}, field, { morue: '...', bofProperty: 'mabite' } ) );

        done();

      } );

    } );

    it( 'handleHook - call all after functions of an array', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields,
        data: {}
      };
      const step = {
        field,
        after: [
          ( f, fs, h, next ) => {

            f.morue = '...';

            f.should.eql( Object.assign( {}, field, { morue: '...' } ) );
            fs.should.eql( [ field ] );
            h.should.eql( hook );

            next();

          }, ( f, fs, h, next ) => {

            f.bofProperty = 'mabite';

            f.should.eql( Object.assign( {}, field, { morue: '...', bofProperty: 'mabite' } ) );
            fs.should.eql( [ Object.assign( {}, field, { morue: '...' } ) ] );
            h.should.eql( hook );

            next();

          }
        ]
      };

      const _hooks = method.handleHook( 'after', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).equal( null );
        h.fields[ 0 ].morue.should.equal( '...' );
        h.fields[ 0 ].bofProperty.should.equal( 'mabite' );
        h.should.eql( hook );

        done();

      } );

    } );

    it( 'handleHook - hooks works with promise', done => {

      const field = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const fields = [ _.clone( field ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const step = {
        field,
        before: [
          ( f, fs, h ) => {

            f.morue = '...';

            f.should.eql( Object.assign( {}, field, { morue: '...' } ) );
            fs.should.eql( [ field ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty = 'mabite';

            f.should.eql( Object.assign( {}, field, { morue: '...', bofProperty: 'mabite' } ) );
            fs.should.eql( [ Object.assign( {}, field, { morue: '...' } ) ] );
            h.should.eql( hook );

            return Promise.reject( 'ERROR' );

          }
        ]
      };

      const _hooks = method.handleHook( 'before', hook, step, fields, 0 );

      async.compose.apply( null, _hooks.reverse() )( hook, ( err, h ) => {

        should( err ).not.equal( null );
        should( err ).eql( _.merge( {}, hook, { error: 'ERROR' } ) );
        should( h ).equal( undefined );
        err.fields[ 0 ].should.eql( Object.assign( {}, field, { morue: '...', bofProperty: 'mabite' } ) );

        done();

      } );

    } );

  } );

  describe( 'composeHook', () => {

    it( 'composeHook - iterate on before hooks', done => {

      const field1 = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const field2 = {
        name: 'entity_uid',
        table: 'feed',
        dataKey: 'entityUid'
      };
      const fields = [ _.clone( field1 ), _.clone( field2 ) ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const hooks = [ {
        field: field1,
        before: [
          ( f, fs, h ) => {

            f.morue = '...';

            f.should.eql( Object.assign( {}, field1, { morue: '...' } ) );
            fs.should.eql( [ field1, field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty = 'mabite';

            f.should.eql( Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ) );
            fs.should.eql( [ Object.assign( {}, field1, { morue: '...' } ), field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }
        ]
      }, {
        field: field2,
        before: [
          ( f, fs, h ) => {

            f.morue2 = '...';

            f.should.eql( Object.assign( {}, field2, { morue2: '...' } ) );
            fs.should.eql( [ Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ), field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty2 = 'mabite';

            f.should.eql( Object.assign( {}, field2, { morue2: '...', bofProperty2: 'mabite' } ) );
            fs.should.eql( [
              Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ),
              Object.assign( {}, field2, { morue2: '...' } )
            ] );
            h.should.eql( hook );

            return Promise.reject( 'ERROR' );

          }
        ]
      } ];

      method.composeHook( hooks, fields, 'before' )( hook, ( err, h ) => {

        should( err ).not.equal( null );
        should( err ).eql( _.merge( {}, hook, { error: 'ERROR' } ) );
        should( h ).equal( undefined );
        err.fields[ 0 ].should.eql( Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ) );

        done();

      } );

    } );

    it( 'composeHook - iterate on before hooks with blank field between two hooks', done => {

      const field1 = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const field2 = {
        name: 'entity_uid',
        table: 'feed',
        dataKey: 'entityUid'
      };
      const fields = [
        _.clone( field1 ),
        undefined,
        _.clone( field2 )
      ];
      const hook = {
        result: null,
        error: null,
        fields: [],
        data: {}
      };
      const hooks = [ {
        field: field1,
        before: [
          ( f, fs, h ) => {

            f.morue = '...';

            f.should.eql( Object.assign( {}, field1, { morue: '...' } ) );
            fs.should.eql( [ field1, undefined, field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty = 'mabite';

            f.should.eql( Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ) );
            fs.should.eql( [ Object.assign( {}, field1, { morue: '...' } ), undefined, field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }
        ]
      }, {
        before: ( f, fs, h ) => {

          should( f ).eql( undefined );
          fs.should.eql( [
            Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ),
            undefined,
            field2
          ] );
          h.should.eql( hook );

          return Promise.resolve();

        }
      }, {
        field: field2,
        before: [
          ( f, fs, h ) => {

            f.morue2 = '...';

            f.should.eql( Object.assign( {}, field2, { morue2: '...' } ) );
            fs.should.eql( [
              Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ),
              undefined,
              field2
            ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty2 = 'mabite';

            f.should.eql( Object.assign( {}, field2, { morue2: '...', bofProperty2: 'mabite' } ) );
            fs.should.eql( [
              Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ),
              undefined,
              Object.assign( {}, field2, { morue2: '...' } )
            ] );
            h.should.eql( hook );

            return Promise.reject( 'ERROR' );

          }
        ]
      } ];

      method.composeHook( hooks, fields, 'before' )( hook, ( err, h ) => {

        should( err ).not.equal( null );
        should( err ).eql( _.merge( {}, hook, { error: 'ERROR' } ) );
        should( h ).equal( undefined );
        err.fields[ 0 ].should.eql( Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ) );

        done();

      } );

    } );

    it( 'composeHook - iterate on after hooks', done => {

      const field1 = {
        name: 'entity_type',
        table: 'feed',
        dataKey: 'entityType'
      };
      const field2 = {
        name: 'entity_uid',
        table: 'feed',
        dataKey: 'entityUid'
      };
      const fields = [ _.clone( field1 ), _.clone( field2 ) ];
      const hook = {
        result: null,
        error: null,
        fields: fields,
        data: {}
      };
      const hooks = [ {
        field: field1,
        after: [
          ( f, fs, h ) => {

            f.morue = '...';

            f.should.eql( Object.assign( {}, field1, { morue: '...' } ) );
            fs.should.eql( [ field1, field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty = 'mabite';

            f.should.eql( Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ) );
            fs.should.eql( [ Object.assign( {}, field1, { morue: '...' } ), field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }
        ]
      }, {
        field: field2,
        after: [
          ( f, fs, h ) => {

            f.morue2 = '...';

            f.should.eql( Object.assign( {}, field2, { morue2: '...' } ) );
            fs.should.eql( [ Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ), field2 ] );
            h.should.eql( hook );

            return Promise.resolve();

          }, ( f, fs, h ) => {

            f.bofProperty2 = 'mabite';

            f.should.eql( Object.assign( {}, field2, { morue2: '...', bofProperty2: 'mabite' } ) );
            fs.should.eql( [
              Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ),
              Object.assign( {}, field2, { morue2: '...' } )
            ] );
            h.should.eql( hook );

            return Promise.reject( 'ERROR' );

          }
        ]
      } ];

      method.composeHook( hooks, fields, 'after' )( hook, ( err, h ) => {

        should( err ).not.equal( null );
        should( err ).eql( _.merge( {}, hook, { error: 'ERROR' } ) );
        should( h ).equal( undefined );
        err.fields[ 0 ].should.eql( Object.assign( {}, field1, { morue: '...', bofProperty: 'mabite' } ) );

        done();

      } );

    } );

  } );

  describe( 'call', () => {

    it( 'call with callback', done => {

      const hook = { hooky: 'luck' };

      method.call( ( h, next ) => {

        h.should.eql( h );

        next( null, hook );

      } )( hook, ( err, result ) => {

        should( err ).equal( null );
        result.should.eql( hook );

        done();

      } );

    } );

    it( 'call with promise', done => {

      const hook = { hooky: 'luck' };

      method.call( h => {

        h.should.eql( h );

        return Promise.resolve();

      } )( hook, ( err, result ) => {

        should( err ).equal( null );
        result.should.eql( hook );

        done();

      } );

    } );

  } );

  describe( 'complete method', () => {

    it( 'method with callback', done => {

      const defaultHook = {
        data: {
          entityType: 'user',
          entityUid: 42
        },
        schema: {}
      };

      method( [
        {
          field: {
            name: 'entity_type',
            table: 'feed',
            dataKey: 'entityType'
          },
          before: ( field, fields, hook, next ) => {

            _.merge( hook.schema, {
              [field.dataKey]: {
                type: 'choice',
                optional: false
              }
            } );

            next( null, hook );

          }
        }, {
          field: {
            name: 'entity_uid',
            table: 'feed',
            dataKey: 'entityUid'
          },
          before: ( field, fields, hook, next ) => {

            _.merge( hook.schema, {
              [field.dataKey]: {
                type: 'number',
                optional: false
              }
            } );

            next( null, hook );

          }
        }
      ], ( hook, next ) => {

        hook.should.eql( _.merge( {}, defaultHook, {
          result: null,
          error: null,
          schema: {
            entityType: {
              type: 'choice',
              optional: false
            },
            entityUid: {
              type: 'number',
              optional: false
            }
          },
          fields: [
            { name: 'entity_type', table: 'feed', dataKey: 'entityType' },
            { name: 'entity_uid', table: 'feed', dataKey: 'entityUid' }
          ]
        } ) );

        next( null, 'result' );

      }, { defaultHook }, ( err, result ) => {

        should( err ).equal( null );
        result.should.equal( 'result' );

        done();

      } );

    } );

    it( 'method with promise', () => {

      const defaultHook = {
        data: {
          entityType: 'user',
          entityUid: 42
        },
        schema: {}
      };

      return method( [
        {
          field: {
            name: 'entity_type',
            table: 'feed',
            dataKey: 'entityType'
          },
          before: ( field, fields, hook, next ) => {

            _.merge( hook.schema, {
              [field.dataKey]: {
                type: 'choice',
                optional: false
              }
            } );

            next( null, hook );

          }
        }, {
          field: {
            name: 'entity_uid',
            table: 'feed',
            dataKey: 'entityUid'
          },
          before: ( field, fields, hook, next ) => {

            _.merge( hook.schema, {
              [field.dataKey]: {
                type: 'number',
                optional: false
              }
            } );

            next( null, hook );

          }
        }
      ], ( hook, next ) => {

        hook.should.eql( _.merge( {}, defaultHook, {
          result: null,
          error: null,
          schema: {
            entityType: {
              type: 'choice',
              optional: false
            },
            entityUid: {
              type: 'number',
              optional: false
            }
          },
          fields: [
            { name: 'entity_type', table: 'feed', dataKey: 'entityType' },
            { name: 'entity_uid', table: 'feed', dataKey: 'entityUid' }
          ]
        } ) );

        next( null, 'result' );

      }, { defaultHook } )
        .should.fulfilledWith( 'result' );

    } );

  } );

} );

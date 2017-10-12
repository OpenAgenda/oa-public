"use strict";

const should = require( 'should' );
const sinon = require( 'sinon' );
const logs = require( '../' );
const DebugTransport = require( '../DebugTransport' );

describe( 'logs', () => {

  describe( 'basic logger', () => {

    it( 'prefix and namespace', () => {

      logs.init( { debug: { enable: true, prefix: 'oa:' }, namespace: 'basic-logger' } );

      const transport = logs.getTransports().debug;

      transport.prefix.should.equal( 'oa:' );
      transport.namespace.should.equal( 'basic-logger' );
      transport.debug.namespace.should.equal( 'oa:basic-logger' );

    } );

    it( 'log with debug', () => {

      logs.init( { debug: { enable: true } } );

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'info', 'Du gros %s', 'boudin' );

      transport.name.should.equal( 'debug' );
      transport.should.instanceOf( DebugTransport );
      spy.callCount.should.equal( 1 );
      spy.calledWith( 'info', 'Du gros boudin' ).should.equal( true );

    } );

    it( 'log with logentries + debug', () => {

      logs.init( {
        debug: { enable: true },
        token: '2624667a-1903-4d21-8d5d-ea14b86409aa'
      } );

      const transportDebug = logs.getTransports().debug;
      const transportLogentries = logs.getTransports().logentries;
      const spyDebug = sinon.spy( transportDebug, 'log' );
      const spyLogentries = sinon.spy( transportLogentries, 'log' );

      logs( 'info', 'Un log %s', 'bidon' );

      transportDebug.name.should.equal( 'debug' );
      spyDebug.callCount.should.equal( 1 );
      spyDebug.calledWith( 'info', 'Un log bidon' ).should.equal( true );

      transportLogentries.name.should.equal( 'logentries' );
      spyLogentries.calledOnce.should.equal( true );
      spyLogentries.calledWith( 'info', 'Un log bidon' ).should.equal( true );

    } );

    it( 'levels', () => {

      logs.init( { debug: { enable: true } } );

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'error', 'Du gros %s', 'boudin' );
      logs( 'warn', 'Du gros %s', 'boudin' );
      logs( 'info', 'Du gros %s', 'boudin' );
      logs( 'verbose', 'Du gros %s', 'boudin' );
      logs( 'debug', 'Du gros %s', 'boudin' );
      logs( 'silly', 'Du gros %s', 'boudin' );

      logs.error( 'Du gros %s', 'boudin' );
      logs.warn( 'Du gros %s', 'boudin' );
      logs.info( 'Du gros %s', 'boudin' );
      logs.verbose( 'Du gros %s', 'boudin' );
      logs.debug( 'Du gros %s', 'boudin' );
      logs.silly( 'Du gros %s', 'boudin' );

      spy.callCount.should.equal( 10 );

      transport.level = 'silly';

      logs( 'silly', 'Du gros %s', 'boudin' );
      logs.silly( 'Du gros %s', 'boudin' );

      spy.callCount.should.equal( 12 );

      spy.getCall( 0 ).args.slice( 0, -1 ).should.eql( [ 'error', 'Du gros boudin', {} ] );
      spy.getCall( 1 ).args.slice( 0, -1 ).should.eql( [ 'warn', 'Du gros boudin', {} ] );
      spy.getCall( 2 ).args.slice( 0, -1 ).should.eql( [ 'info', 'Du gros boudin', {} ] );
      spy.getCall( 3 ).args.slice( 0, -1 ).should.eql( [ 'verbose', 'Du gros boudin', {} ] );
      spy.getCall( 4 ).args.slice( 0, -1 ).should.eql( [ 'debug', 'Du gros boudin', {} ] );

      spy.getCall( 5 ).args.slice( 0, -1 ).should.eql( [ 'error', 'Du gros boudin', {} ] );
      spy.getCall( 6 ).args.slice( 0, -1 ).should.eql( [ 'warn', 'Du gros boudin', {} ] );
      spy.getCall( 7 ).args.slice( 0, -1 ).should.eql( [ 'info', 'Du gros boudin', {} ] );
      spy.getCall( 8 ).args.slice( 0, -1 ).should.eql( [ 'verbose', 'Du gros boudin', {} ] );
      spy.getCall( 9 ).args.slice( 0, -1 ).should.eql( [ 'debug', 'Du gros boudin', {} ] );

      spy.getCall( 10 ).args.slice( 0, -1 ).should.eql( [ 'silly', 'Du gros boudin', {} ] );
      spy.getCall( 11 ).args.slice( 0, -1 ).should.eql( [ 'silly', 'Du gros boudin', {} ] );

    } );

    it( 'format message', () => {

      logs.init( { debug: { enable: true } } );

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      spy.calledWith( 'info', 'Un chargement à 42%, {"object":{"hmm":"pkpa"}}', { meta: 'berthoBestDev' } )
        .should.equal( true );

    } );

  } );

  describe( 'namespaced logger', () => {

    it( 'prefix and namespace', () => {

      logs.init( { debug: { enable: true, prefix: 'oa:' } } );

      const log = logs( 'test-i-cule' );

      const transport = log.getTransports().debug;

      transport.prefix.should.equal( 'oa:' );
      transport.namespace.should.equal( 'test-i-cule' );
      transport.debug.namespace.should.equal( 'oa:test-i-cule' );

    } );

    it( 'log with debug', () => {

      logs.init( { debug: { enable: true, prefix: 'oa:' } } );

      const log = logs( 'test-i-cule', { preloaded: 'gnééé' } );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Du gros %s', 'boudin' );

      transport.name.should.equal( 'debug' );
      transport.should.instanceOf( DebugTransport );
      spy.callCount.should.equal( 1 );
      spy.calledWith( 'info', 'Du gros boudin', { preloaded: 'gnééé' } ).should.equal( true );

    } );

    it( 'log with logentries + debug', () => {

      logs.init( {
        debug: { enable: true, prefix: 'oa:' },
        token: '2624667a-1903-4d21-8d5d-ea14b86409aa'
      } );

      const log = logs( 'test' );

      const transportDebug = log.getTransports().debug;
      const transportLogentries = log.getTransports().logentries;
      const spyDebug = sinon.spy( transportDebug, 'log' );
      const spyLogentries = sinon.spy( transportLogentries, 'log' );

      log( 'info', 'Un log %s', 'bidon' );

      transportDebug.name.should.equal( 'debug' );
      transportDebug.debug.namespace.should.equal( 'oa:test' );
      spyDebug.callCount.should.equal( 1 );
      spyDebug.calledWith( 'info', 'Un log bidon' ).should.equal( true );

      transportLogentries.name.should.equal( 'logentries' );
      spyLogentries.calledOnce.should.equal( true );
      spyLogentries.calledWith( 'info', 'Un log bidon' ).should.equal( true );

    } );

    it( 'levels', () => {

      logs.init( { debug: { enable: true } } );

      const log = logs( 'test-2' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'error', 'Du gros %s', 'boudin' );
      log( 'warn', 'Du gros %s', 'boudin' );
      log( 'info', 'Du gros %s', 'boudin' );
      log( 'verbose', 'Du gros %s', 'boudin' );
      log( 'debug', 'Du gros %s', 'boudin' );
      log( 'silly', 'Du gros %s', 'boudin' );

      log.error( 'Du gros %s', 'boudin' );
      log.warn( 'Du gros %s', 'boudin' );
      log.info( 'Du gros %s', 'boudin' );
      log.verbose( 'Du gros %s', 'boudin' );
      log.debug( 'Du gros %s', 'boudin' );
      log.silly( 'Du gros %s', 'boudin' );

      spy.callCount.should.equal( 10 );

      transport.level = 'silly';

      log( 'silly', 'Du gros %s', 'boudin' );
      log.silly( 'Du gros %s', 'boudin' );

      spy.callCount.should.equal( 12 );

      spy.getCall( 0 ).args.slice( 0, -1 ).should.eql( [ 'error', 'Du gros boudin', {} ] );
      spy.getCall( 1 ).args.slice( 0, -1 ).should.eql( [ 'warn', 'Du gros boudin', {} ] );
      spy.getCall( 2 ).args.slice( 0, -1 ).should.eql( [ 'info', 'Du gros boudin', {} ] );
      spy.getCall( 3 ).args.slice( 0, -1 ).should.eql( [ 'verbose', 'Du gros boudin', {} ] );
      spy.getCall( 4 ).args.slice( 0, -1 ).should.eql( [ 'debug', 'Du gros boudin', {} ] );

      spy.getCall( 5 ).args.slice( 0, -1 ).should.eql( [ 'error', 'Du gros boudin', {} ] );
      spy.getCall( 6 ).args.slice( 0, -1 ).should.eql( [ 'warn', 'Du gros boudin', {} ] );
      spy.getCall( 7 ).args.slice( 0, -1 ).should.eql( [ 'info', 'Du gros boudin', {} ] );
      spy.getCall( 8 ).args.slice( 0, -1 ).should.eql( [ 'verbose', 'Du gros boudin', {} ] );
      spy.getCall( 9 ).args.slice( 0, -1 ).should.eql( [ 'debug', 'Du gros boudin', {} ] );

      spy.getCall( 10 ).args.slice( 0, -1 ).should.eql( [ 'silly', 'Du gros boudin', {} ] );
      spy.getCall( 11 ).args.slice( 0, -1 ).should.eql( [ 'silly', 'Du gros boudin', {} ] );

    } );

    it( 'format message', () => {

      logs.init( { debug: { enable: true } } );

      const log = logs( 'test-3' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      spy.calledWith( 'info', 'Un chargement à 42%, {"object":{"hmm":"pkpa"}}', { meta: 'berthoBestDev' } )
        .should.equal( true );

    } );

    it( 'loadMetadata - preload metadata', () => {

      logs.init( { debug: { enable: true } } );

      const log = logs( 'test-4' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log.loadMetadata( { preloaded: 'data' } );
      log.loadMetadata( { additionnal: 'data' } );

      log( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      spy.calledWith( 'info', 'Un chargement à 42%, {"object":{"hmm":"pkpa"}}', {
        preloaded: 'data',
        additionnal: 'data',
        meta: 'berthoBestDev'
      } )
        .should.equal( true );

    } );

    it( 'clearMetadata - clear preloaded metadata', () => {

      logs.init( { debug: { enable: true } } );

      const log = logs( 'test-4' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log.loadMetadata( { preloaded: 'data' } );
      log.loadMetadata( { additionnal: 'data' } );

      log.clearMetadata();

      log.loadMetadata( { other: 'data' } );

      log( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      spy.calledWith( 'info', 'Un chargement à 42%, {"object":{"hmm":"pkpa"}}', {
        other: 'data',
        meta: 'berthoBestDev'
      } )
        .should.equal( true );

    } );

    it( 'setConfig - set config of a logger', () => {

      logs.init( { debug: { enable: true, prefix: 'oa:' } } );

      const log = logs( 'test-5' );

      log.setConfig( { debug: { enable: true, prefix: 'prefix:' }, namespace: log.options.namespace } );

      const transport = log.getTransports().debug;

      transport.prefix.should.equal( 'prefix:' );
      transport.namespace.should.equal( 'test-5' );
      transport.debug.namespace.should.equal( 'prefix:test-5' );

    } );

  } );

  describe( 'set module config', () => {

    it( 'set config of a module', () => {

      logs.init( { debug: { enable: true, prefix: 'oa:' } } );

      const log = logs( 'test-5', { $callerModule: 'module' } ); // second args only for test

      log.callerModule = 'module';
      logs.setModuleConfig( { debug: { enable: true, prefix: 'prefix:' } }, 'module' ); // second args only for test

      const transport = log.getTransports().debug;

      transport.prefix.should.equal( 'prefix:' );
      transport.namespace.should.equal( 'test-5' );
      transport.debug.namespace.should.equal( 'prefix:test-5' );

    } );

  } );

} );

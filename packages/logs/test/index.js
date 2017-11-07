"use strict";

const should = require( 'should' );
const sinon = require( 'sinon' );
const logs = require( '../' );
const DebugTransport = require( '../DebugTransport' );

describe( 'logs', () => {

  describe( 'basic logger', () => {

    it( 'prefix and namespace', () => {

      logs.init( { debug: { prefix: 'oa:' }, namespace: 'basic-logger' } );

      const transport = logs.getTransports().debug;

      transport.prefix.should.equal( 'oa:' );
      transport.namespace.should.equal( 'basic-logger' );
      transport.debug.namespace.should.equal( 'oa:basic-logger' );

    } );

    it( 'log with debug', () => {

      logs.init();

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'info', 'Du gros %s', 'boudin' );

      transport.name.should.equal( 'debug' );
      transport.should.instanceOf( DebugTransport );
      sinon.assert.calledOnce( spy );
      sinon.assert.calledWith( spy, 'info', 'Du gros boudin' );

    } );

    it( 'log with logentries + debug', () => {

      logs.init( {
        token: '2624667a-1903-4d21-8d5d-ea14b86409aa'
      } );

      const transportDebug = logs.getTransports().debug;
      const transportLogentries = logs.getTransports().logentries;
      const spyDebug = sinon.spy( transportDebug, 'log' );
      const spyLogentries = sinon.spy( transportLogentries, 'log' );

      logs( 'info', 'Un log %s', 'bidon' );

      transportDebug.name.should.equal( 'debug' );
      sinon.assert.calledOnce( spyDebug );
      sinon.assert.calledWith( spyDebug, 'info', 'Un log bidon' );

      transportLogentries.name.should.equal( 'logentries' );
      sinon.assert.calledOnce( spyLogentries );
      sinon.assert.calledWith( spyLogentries, 'info', 'Un log bidon' );

    } );

    it( 'levels', () => {

      logs.init();

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

      sinon.assert.callCount( spy, 10 );

      transport.level = 'silly';

      logs( 'silly', 'Du gros %s', 'boudin' );
      logs.silly( 'Du gros %s', 'boudin' );

      sinon.assert.calledWith( spy.getCall( 0 ), 'error', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 1 ), 'warn', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 2 ), 'info', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 3 ), 'verbose', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 4 ), 'debug', 'Du gros boudin', {} );

      sinon.assert.calledWith( spy.getCall( 5 ), 'error', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 6 ), 'warn', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 7 ), 'info', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 8 ), 'verbose', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 9 ), 'debug', 'Du gros boudin', {} );

      sinon.assert.calledWith( spy.getCall( 10 ), 'silly', 'Du gros boudin', {} );
      sinon.assert.calledWith( spy.getCall( 11 ), 'silly', 'Du gros boudin', {} );

    } );

    it( 'format message', () => {

      logs.init();

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      sinon.assert.calledWith( spy,
        'info',
        'Un chargement à 42%, {"object":{"hmm":"pkpa"}}',
        { meta: 'berthoBestDev' }
      );

    } );

  } );

  describe( 'namespaced logger', () => {

    it( 'prefix and namespace', () => {

      logs.init( { debug: { prefix: 'oa:' } } );

      const log = logs( 'test-i-cule' );

      const transport = log.getTransports().debug;

      transport.prefix.should.equal( 'oa:' );
      transport.namespace.should.equal( 'test-i-cule' );
      transport.debug.namespace.should.equal( 'oa:test-i-cule' );

    } );

    it( 'log with debug', () => {

      logs.init( { debug: { prefix: 'oa:' } } );

      const log = logs( 'test-i-cule', { preloaded: 'gnééé' } );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Du gros %s', 'boudin' );

      transport.name.should.equal( 'debug' );
      transport.should.instanceOf( DebugTransport );
      sinon.assert.calledOnce( spy );
      sinon.assert.calledWith( spy, 'info', 'Du gros boudin', { namespace: 'test-i-cule', preloaded: 'gnééé' } );

    } );

    it( 'log with logentries + debug', () => {

      logs.init( {
        debug: { prefix: 'oa:' },
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
      sinon.assert.calledOnce( spyDebug );
      sinon.assert.calledWith( spyDebug, 'info', 'Un log bidon', { namespace: 'test' } );

      transportLogentries.name.should.equal( 'logentries' );
      sinon.assert.calledOnce( spyLogentries );
      sinon.assert.calledWith( spyLogentries, 'info', 'Un log bidon', { namespace: 'test' } );

    } );

    it( 'levels', () => {

      logs.init();

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

      sinon.assert.callCount( spy, 10 );

      transport.level = 'silly';

      log( 'silly', 'Du gros %s', 'boudin' );
      log.silly( 'Du gros %s', 'boudin' );

      sinon.assert.callCount( spy, 12 );

      sinon.assert.calledWith( spy.getCall( 0 ), 'error', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 1 ), 'warn', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 2 ), 'info', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 3 ), 'verbose', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 4 ), 'debug', 'Du gros boudin', { namespace: 'test-2' } );

      sinon.assert.calledWith( spy.getCall( 5 ), 'error', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 6 ), 'warn', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 7 ), 'info', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 8 ), 'verbose', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 9 ), 'debug', 'Du gros boudin', { namespace: 'test-2' } );

      sinon.assert.calledWith( spy.getCall( 10 ), 'silly', 'Du gros boudin', { namespace: 'test-2' } );
      sinon.assert.calledWith( spy.getCall( 11 ), 'silly', 'Du gros boudin', { namespace: 'test-2' } );

    } );

    it( 'format message', () => {

      logs.init();

      const log = logs( 'test-3' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      sinon.assert.calledWith( spy,
        'info',
        'Un chargement à 42%, {"object":{"hmm":"pkpa"}}',
        { meta: 'berthoBestDev', namespace: 'test-3' }
        );

    } );

    it( 'loadMetadata - preload metadata', () => {

      logs.init();

      const log = logs( 'test-4' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log.loadMetadata( { preloaded: 'data' } );
      log.loadMetadata( { additionnal: 'data' } );

      log( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      sinon.assert.calledWith( spy, 'info', 'Un chargement à 42%, {"object":{"hmm":"pkpa"}}', {
        namespace: 'test-4',
        preloaded: 'data',
        additionnal: 'data',
        meta: 'berthoBestDev'
      } );

    } );

    it( 'clearMetadata - clear preloaded metadata', () => {

      logs.init();

      const log = logs( 'test-4' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log.loadMetadata( { preloaded: 'data' } );
      log.loadMetadata( { additionnal: 'data' } );

      log.clearMetadata();

      log.loadMetadata( { other: 'data' } );

      log( 'info', 'Un %s à %d%%, %j', 'chargement', 42, { object: { hmm: 'pkpa' } }, { meta: 'berthoBestDev' } );

      sinon.assert.calledWith( spy, 'info', 'Un chargement à 42%, {"object":{"hmm":"pkpa"}}', {
        namespace: 'test-4',
        other: 'data',
        meta: 'berthoBestDev'
      } );

    } );

    it( 'setConfig - set config of a logger', () => {

      logs.init( { debug: { prefix: 'oa:' } } );

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

      logs.init( { debug: { prefix: 'oa:' } } );

      const log = logs( 'test-5', { $callerModule: 'module' } ); // second args only for test

      log.callerModule = 'module';
      logs.setModuleConfig( { debug: { prefix: 'prefix:' } }, 'module' ); // second args only for test

      const transport = log.getTransports().debug;

      transport.prefix.should.equal( 'prefix:' );
      transport.namespace.should.equal( 'test-5' );
      transport.debug.namespace.should.equal( 'prefix:test-5' );

    } );

  } );

} );

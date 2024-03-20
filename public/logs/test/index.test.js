"use strict";

const sinon = require( 'sinon' );
const winston = require( 'winston' );
const logs = require( '../' );
const DebugTransport = require( '../transports/DebugTransport' );

describe( 'logs', () => {

  describe( 'basic logger', () => {

    it( 'prefix and namespace', () => {

      logs.init( { prefix: 'oa:', namespace: 'basic-logger' } );

      const transport = logs.getTransports().debug;

      expect( transport.prefix ).toBe( 'oa:' );
      expect( transport.namespace ).toBe( 'basic-logger' );
      expect( transport.debug.namespace ).toBe( 'oa:basic-logger' );

    } );

    it( 'log with debug', () => {

      logs.init();

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'info', 'Du gros %s', 'boudin' );

      expect( transport.name ).toBe( 'debug' );
      expect( transport ).toBeInstanceOf( DebugTransport );
      sinon.assert.calledOnce( spy );
      sinon.assert.calledWith( spy, 'info', 'Du gros boudin' );

    } );

    it( 'log with insightOps + debug', () => {

      logs.init( {
        token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
      } );

      const transportDebug = logs.getTransports().debug;
      const transportInsightOps = logs.getTransports().insightOps;
      const spyDebug = sinon.spy( transportDebug, 'log' );
      const spyInsightOps = sinon.spy( transportInsightOps, 'log' );

      logs( 'info', 'Un log %s', 'bidon' );

      expect( transportDebug.name ).toBe( 'debug' );
      sinon.assert.calledOnce( spyDebug );
      sinon.assert.calledWith( spyDebug, 'info', 'Un log bidon' );

      expect( transportInsightOps.name ).toBe( 'insightOps' );
      sinon.assert.calledOnce( spyInsightOps );
      sinon.assert.calledWith( spyInsightOps, 'info', 'Un log bidon' );

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

    it( 'logs errors stack', () => {

      logs.init( { namespace: 'error-stack' } );

      const transport = logs.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      logs( 'error', new Error( 'Une erreur ici !' ) );
      logs( 'error', 'On a eu une erreur:', new Error( 'Une erreur ici !' ) );
      logs( 'error', 'On a eu une erreur: %s', new Error( 'Une erreur ici !' ) );

      sinon.assert.calledWith(
        spy.getCall( 0 ),
        'error',
        '',
        sinon.match( { message: 'Une erreur ici !' } )
      );

      sinon.assert.calledWith(
        spy.getCall( 1 ),
        'error',
        'On a eu une erreur:',
        sinon.match( { message: 'Une erreur ici !' } )
      );

      sinon.assert.calledWith(
        spy.getCall( 2 ),
        'error',
        sinon.match( 'On a eu une erreur: Error: Une erreur ici !' )
      );

    } );

  } );

  describe( 'namespaced logger', () => {

    it( 'prefix and namespace', () => {

      logs.init( { prefix: 'oa:' } );

      const log = logs( 'test-i-cule' );

      const transport = log.getTransports().debug;

      expect( transport.prefix ).toBe( 'oa:' );
      expect( transport.namespace ).toBe( 'test-i-cule' );
      expect( transport.debug.namespace ).toBe( 'oa:test-i-cule' );

    } );

    it( 'log with debug', () => {

      logs.init( { prefix: 'oa:' } );

      const log = logs( 'test-i-cule', { preloaded: 'gnééé' } );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Du gros %s', 'boudin' );

      expect( transport.name ).toBe( 'debug' );
      expect( transport ).toBeInstanceOf( DebugTransport );
      sinon.assert.calledOnce( spy );
      sinon.assert.calledWith( spy, 'info', 'Du gros boudin', { namespace: 'test-i-cule', preloaded: 'gnééé' } );

    } );

    it( 'log with insightOps + debug', () => {

      logs.init( {
        prefix: 'oa:',
        token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
      } );

      const log = logs( 'test' );

      const transportDebug = log.getTransports().debug;
      const transportInsightOps = log.getTransports().insightOps;
      const spyDebug = sinon.spy( transportDebug, 'log' );
      const spyInsightOps = sinon.spy( transportInsightOps, 'log' );

      log( 'info', 'Un log %s', 'bidon' );

      expect( transportDebug.name ).toBe( 'debug' );
      expect( transportDebug.namespace ).toBe( 'test' );
      sinon.assert.calledOnce( spyDebug );
      sinon.assert.calledWith( spyDebug, 'info', 'Un log bidon', { namespace: 'test' } );

      expect( transportInsightOps.name ).toBe( 'insightOps' );
      sinon.assert.calledOnce( spyInsightOps );
      sinon.assert.calledWith( spyInsightOps, 'info', 'Un log bidon', { namespace: 'test' } );

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

    it( 'log with falsy ending value', () => {

      logs.init();

      const log = logs( 'test-7' );

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Je veux un zéro comme ça:', 0 );

      sinon.assert.calledWith( spy,
        'info',
        'Je veux un zéro comme ça:',
        { namespace: 'test-7' }
      );

      log( 'info', 'Je veux un zéro comme ça: %d', 0 );

      sinon.assert.calledWith( spy,
        'info',
        'Je veux un zéro comme ça: 0',
        { namespace: 'test-7' }
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

      logs.init( { prefix: 'oa:' } );

      const log = logs( 'test-5' );

      log.setConfig( { prefix: 'prefix:', namespace: log.options.namespace, enableDebug: true } );

      const transport = log.getTransports().debug;

      expect( transport.prefix ).toBe( 'prefix:' );
      expect( transport.namespace ).toBe( 'test-5' );
      expect( transport.debug.namespace ).toBe( 'prefix:test-5' );

    } );

    it( 'logs errors stack', () => {

      logs.init( {
        prefix: 'oa:',
        token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        namespace: 'error-stack'
      } );

      const log = logs( 'test-5' );

      const transport = log.getTransports().insightOps;
      const spy = sinon.spy( transport, 'log' );

      log( 'error', new Error( 'Une erreur ici !' ) );
      log( 'error', 'On a eu une erreur:', new Error( 'Une erreur ici !' ) );
      log( 'error', 'On a eu une erreur: %s', new Error( 'Une erreur ici !' ), { test: 789 } );
      log( 'error', 'Error with event %s, (%s)', 'un-event', 12345678, new Error('Une erreur bidon.') );

      sinon.assert.calledWith(
        spy.getCall( 0 ),
        'error',
        '',
        sinon.match( { namespace: 'test-5', error: { message: 'Une erreur ici !' } } )
      );

      sinon.assert.calledWith(
        spy.getCall( 1 ),
        'error',
        'On a eu une erreur:',
        sinon.match( { namespace: 'test-5', error: { message: 'Une erreur ici !' } } )
      );

      sinon.assert.calledWith(
        spy.getCall( 2 ),
        'error',
        sinon.match( 'On a eu une erreur: Error: Une erreur ici !' ),
        { namespace: 'test-5', test: 789 }
      );

      sinon.assert.calledWith(
        spy.getCall( 3 ),
        'error',
        sinon.match( 'Error with event un-event, (12345678)' ),
        sinon.match( {
          namespace: 'test-5',
          error: {
            message: 'Une erreur bidon.',
            stack: sinon.match('Error: Une erreur bidon.\n    at')
          }
        } )
      );

    } );

  } );

  describe( 'set module config', () => {

    it( 'set config of a module', () => {

      logs.init( { prefix: 'oa:' } );

      const log = logs( 'test-5', { $callerModule: 'module' } ); // second args only for test

      log.callerModule = 'module';
      logs.setModuleConfig( { prefix: 'prefix:' }, 'module' ); // second args only for test

      const transport = log.getTransports().debug;

      expect( transport.prefix ).toBe( 'prefix:' );
      expect( transport.namespace ).toBe( 'test-5' );
      expect( transport.debug.namespace ).toBe( 'prefix:test-5' );

    } );

    it( 'conserve loaded metadata before the setModuleConfig', () => {

      logs.init( { prefix: 'oa:' } );

      const log = logs( 'test-6', { $callerModule: 'module-2' } ); // second args only for test

      log.loadMetadata( { preloaded: 'data' } );

      log.callerModule = 'module';
      logs.setModuleConfig( { prefix: 'prefix:' }, 'module-2' ); // second args only for test

      const transport = log.getTransports().debug;
      const spy = sinon.spy( transport, 'log' );

      log( 'info', 'Oh yeah ! J\'ai encore mes metadata !' );

      sinon.assert.calledWith(
        spy.getCall( 0 ),
        'info',
        'Oh yeah ! J\'ai encore mes metadata !',
        sinon.match( { namespace: 'test-6', preloaded: 'data' } )
      );

    } );

  } );

  it( 'add & remove transports', () => {

    expect( logs.add ).toBeInstanceOf( Function );
    expect( logs.remove ).toBeInstanceOf( Function );

    logs.init();

    const log = logs( 'test-4' );

    expect( log.add ).toBeInstanceOf( Function );
    expect( log.remove ).toBeInstanceOf( Function );

    let transports = log.getTransports();
    expect( transports ).toHaveProperty( 'debug' );
    expect( transports ).not.toHaveProperty( 'console' );

    log.add( winston.transports.Console );

    transports = log.getTransports();
    expect( transports ).toHaveProperty( 'debug' );
    expect( transports ).toHaveProperty( 'console' );

    log.remove( 'debug' );

    transports = log.getTransports();
    expect( transports ).not.toHaveProperty( 'debug' );
    expect( transports ).toHaveProperty( 'console' );

  } );

} );

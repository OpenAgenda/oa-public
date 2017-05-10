# Overview

Redis wrapper to provide simple to use interface for http caching.

    const sCache = require( 'simple-cache' );

    sCache.init( '...' );

    app.use( '/a-route', sCache( { namespace: 'agenda', identifier: 'agenda.uid', ttl: '1m' } ) );

Cached data needs to be easily cleared by namespace/identifier pair. So keys can look like this

    'simplecache:agenda:1820:https://whateverspecificurl?must=be&cached='

This is followed by an expires.
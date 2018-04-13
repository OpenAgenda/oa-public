# Overview

Redis wrapper to provide simple to use interface for http caching ( and other types of caching why not. )

Add a cache setter and getter in your middleware flow to handle cached data per namespace/id pairs;

Cache for an object can be managed based on its type and its identifier. Compulsory parameters therefore for the primary service endpoint a namespace and identifier needs to be specified.

# Read & write through service

Use the .get & .set endpoints given by a service( namespace, identifier ) call:

    const simpleCache = require( 'simple-cache' );

    // do this once
    simpleCache.init( { redis, prefix: 'serviceprefix' } );

    let ttl = 10; // seconds

    simpleCache( 'agendas', 12347890 ).set( '/events.json?passed=1', '{jsondatahere}', ttl, ( err, result ) => {

      simpleCache( 'agendas', 12347890 ).get( '/events.json?passed=1', ( err, cachedValue ) => {

        cachedValue // equals {jsondatahere} for 10 seconds.

      } );

    } );

# Read through middleware

See tests.
# Overview

Utility sitting on top of redis queues to provide queue functionality


# V2

New iteration of queue system works as an instanciating call and handles exceptions thrown by called methods to prevent queue from stopping.

A service instance is used as a factory of queues defined by their namespaces. The v2 service instance is created as follows:

    const queues = require( '@openagenda/queues' );

    const v2Queues = queues( {
      redis: aRedisClient,
      prefix: 'aprefixforallv2queues:'
    } );

Getting a handle on an individual v2 queue is done by specifying its identifying namespace in a service instance call:

    const q = v2Queues( 'queue_some_job_type' );

From there, two distinct scenarios take place:

 * When tasks are queued
 * When tasks are processed

Typically, each are called in different places of the application: the tasks can be queued from anywhere, they are typically processed in a script dedicated to job processing.

## Where tasks are queued

Tasks can be queued anywhere in the application where their processing should be transfered to another script/ressource to limit load. This is done by specifying the name of the method to be called when the queue is processed, followed by the arguments to be passed to the function when it is processed:

    q( 'methodName', methodArg1, methodArg2, methodArg3 );

    q( 'otherMethod', otherMethodArg1 );

## Where tasks are processed

All functions must be registered before they can be called:

    const { methodName } = require( './someLib' );
    const otherMethod = require( './otherMethod' ).bind( null, someConfig );

    q.register( {
      methodName,
      otherMethod // other method is bound to a specific configuration
    } );

The register function can be called multiple times and assigns passed functions to a single object.

Once functions are registered, a run method can be called to start processing jobs

    q.run();

### Tracking events

Track them by calling the `.on` method of the queue instance running the queued function calls. Events that can be tracked are `execute` which is called just before a function is executed after being unstacked, `success` is called when the function is done, `error` when functions throw an error:

    q.on( 'error', ( registeredFunctionName, args, error ) => {
      // log it here
    } );


# V1

## How to use

Initialize the service by giving a prefix, a redis config:

    const queues = require( '@openagenda/queues' );

    queues.init( {
      redis: {
        host: 'localhost', // default
        port: 6379 // default
      },
      namespace: 'oaqueues', // default
      separator: ':' // default too!
    } );

Instantiate a queue

    const q = queues( 'bim' );

And depending on where you are, enqueue some data:

    await q( { some: 'data' } );

Or pop some data

    const data = await q.pop(); // you should get some data if it was enqueued

Or wait for something to appear in queue to pop it:

    const data = await q.waitAndPop(); // this will hang until something shows up

Find out about the total number of items inside the queue at any time:

    const total = await q.total();

Clear the queue if need be:

    await q.clear();

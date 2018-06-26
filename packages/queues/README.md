# Overview

Utility sitting on top of redis queues to provide queue functionality

# How to use

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
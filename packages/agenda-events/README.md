# Overview

Handle agenda-event references. Authority for knowing what events are listed in any given agenda

Use likewise:

  // check testconfig.sample.js for service init requirements
  svc.init( { mysql, schemas, legacy, interfaces } );

  // check the events referenced by agenda of id 2802

  svc( 2802 ).list( 0, 20, ( err, refs, total ) => {

    refs[ 0 ] /* looks like this:

    { 
      eventId: 123, 
      agendaId: 2802,
      featured: 0,
      state: 1 ( see svc.states for possible values )
    }

  } );

# Methods

Check tests, they are pretty descriptive.

Services methods are prefixed by a call with agenda id ( as in examples ):

 * **list**: args in order: offset, limit, callback
 * **get**: args in order: eventId, callback
 * **set**: does an update or an insert. takes eventId, data, callback
 * **remove**: removes a reference. takes eventId

## Examples

    svc( 2802 ).list( 0, 10, ( err, refs, total ) => { /* go nuts */ } );

    svc( 2802 ).get( 123, ( err, ref ) => { /* */ } );

    svc( 2802 ).set( 123, {
      featured: true, 
      state: svc.states.PUBLISHED 
    }, ( err, result ) => { ... } );

    svc( 2802 ).remove( 123, ( err, result ) => { ... } );
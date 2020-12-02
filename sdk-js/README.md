OpenAgenda SDK for JavaScript in the browser and Node.js.

## Summary

 - [Installation](#installation)
 - [Configuration](#configuration)
 - [API](#api)
   - [Events](#events)
     - [get](#events-get)
     - [create](#events-create)
     - [update](#events-update)
     - [delete](#events-delete)
   - [Locations](#locations)
     - [create](#locations-create)
 - [Errors](#errors)
   
## Installation

```bash
yarn add @openagenda/sdk-js
```

or

```bash
npm i @openagenda/sdk-js
```
   
## Configuration

In the following examples we use `async` / `await`, you can use the promises if your environment does not allow it.

Before any operation you have to connect, the token is refreshed automatically as soon as it is necessary.

```js
const OaSdk = require('@openagenda/sdk-js');

const oa = new OaSdk( {
  publicKey: 'YOUR-PUBLIC-KEY',
  secretKey: 'YOUR-PRIVATE-KEY'
} );
await oa.connect();
```

The public key is used for `get` method.  
The private key is used for all `create`, `update`, and `delete` methods.

## API

For more information about data formats please refer to the [API documentation](https://openagenda.zendesk.com/hc/fr/categories/115000324454-API) on our help center.

### Events

<h4 id="events-get">get</h4>

```js
const eventUid = 87654321;

const event = await oa.events.get( eventUid );
```

<h4 id="events-create">create</h4>

```js
const agendaUid = 12345678;

const { success, event } = await oa.events.create( agendaUid, {
  slug: 'a-title',
  title: {
    fr: 'Un titre',
    en: 'A title'
  },
  description: {
    fr: 'La description de votre événement',
    en: 'The description of your event'
  },
  locationUid: 78372099,
  timings: [ {
    begin: moment(),
    end: moment().add( 1, 'hour' )
  }, {
    begin: moment().add( 1, 'day' ),
    end: moment().add( 1, 'day' ).add( 1, 'hour' )
  } ]
} );
```

In this example we use [moment](https://momentjs.com/) for manage the timings, but you can also use the native `Date` object.

<h4 id="events-update">update</h4>

```js
const agendaUid = 12345678;
const eventUid = 87654321;

const { event: updatedEvent } = await oa.events.update(
  agendaUid,
  eventUid,
  {
    slug: event.slug,
    title: {
      fr: 'Titre mise à jour',
      en: 'Updated title'
    },
    timings: event.timings
  }
);
```

<h4 id="events-delete">delete</h4>

```js
const agendaUid = 12345678;
const eventUid = 87654321;

await oa.events.delete(
  agendaUid,
  eventUid,
);
```

### Locations

<h4 id="locations-create">create</h4>

```js
const agendaUid = 12345678;

const location = await oa.locations.create( agendaUid, {
  name: 'Gare Meuse TGV',
  address: 'Lieu dit Le Cugnet, 55220 Les Trois-Domaines',
  latitude: 48.9736458,
  longitude: 5.2723537
} );
```

## Errors

Whatever the method if the error comes from the API the error will be in `error.response` and its JSON content in `error.response.body`.

If you use `async` / `await` then you can use `try` / `catch` otherwise you will have to use `.catch`.

async / await example:
```js
try {
  await oa.events.create( 12345678, {
    slug: 'a-title',
    description: {
      fr: 'La description de votre événement',
      en: 'The description of your event'
    },
    locationUid: 87654321,
    timings: [ {
      begin: moment(),
      end: moment().add( 1, 'hour' )
    }, {
      begin: moment().add( 1, 'day' ),
      end: moment().add( 1, 'day' ).add( 1, 'hour' )
    } ]
  } );
} catch ( e ) {
  expect( e.response.body ).to.be.eql( {
    errors: [ {
      field: 'title',
      code: 'required',
      message: 'at least one language entry is required'
    } ]
  } );
}
```

Promise example:
```js
oa.events.create( 12345678, {
  slug: 'a-title',
  description: {
    fr: 'La description de votre événement',
    en: 'The description of your event'
  },
  locationUid: 87654321,
  timings: [ {
    begin: moment(),
    end: moment().add( 1, 'hour' )
  }, {
    begin: moment().add( 1, 'day' ),
    end: moment().add( 1, 'day' ).add( 1, 'hour' )
  } ]
} )
  .then(result => {
    //
  })
  .catch(error => {
    expect( error.response.body ).to.be.eql( {
      errors: [ {
        field: 'title',
        code: 'required',
        message: 'at least one language entry is required'
      } ]
    } );
  });
```

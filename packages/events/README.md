Gérer les 'delete' dans le script de transfer avant intégration.

# Overview

This service provides methods to perform crud operations on events. Other than an origin agenda uid, it does handle any information related to agendas or agenda-decoration data such as tags, categories or custom fields.

Methods include basic crud operations, as well as validation, global stats and a deletion index.


# Structure of an event

## List of fields

These exclude information relative to the event publication state, categorization or decoration in the context of an agenda/calendar.
The only agenda-related information listed here is the 'origin' agenda, where the event was first published

This list is not ( exactly ) the data given in the reboot of the json export. The json export will be a subset of this list, decorated with location details.

id & deletedAt are not mentionned here as their use is strictly internal

| Field name           | required    | read-only    | multilingual | type                  | default       | description
|----------------------|:-----------:|:------------:|:------------:|-----------------------|:-------------:|-------------
| uid                  |      x      |      x       |              | integer               |               | unique identifier
| slug                 |      x      |              |              | text                  |               | unique slug ( used for urls )
| ownerUid             |      x      |      x       |              | integer               |               | uid of the user owning the event
| creatorUid *         |      x      |      x       |              | integer               |               | uid of the user having created the event
| agendaUid            |      x      |              |              | integer               |               | uid of the agenda where the event was created
| locationUid          |             |              |              | integer               |               | uid of the location where the event takes place
| url*                 |             |              |              | link                  |               | for online events, url of the event
| title                |      x      |      x       |      x       | text                  |               | title of the event
| canonicalUrl*        |             |              |              | link                  |               | reference page for the event
| description          |             |              |      x       | text                  |               | short description of the event
| longDescription      |             |              |      x       | text                  |               | long description of the event
| keywords             |             |              |      x       | list of texts         |    []         | keywords of the event
| registration         |             |              |              | list of url/txt/phone |    []         | registration urls, phone numbers or emails
| conditions           |             |              |      x       | text                  |               | condtions of access to the event ( rsvp required, free access... )
| image                |             |              |              | object                |               |
| image.filename       |      x      |      x       |              | text                  |               | name of the image file
| image.credits        |             |              |              | text                  |               | image credits
| image.size           |      x      |              |              | object                |               |
| image.size.width     |      x      |      x       |              | integer               |               | width of the image in pixels
| image.size.height    |      x      |      x       |              | integer               |               | height of the image in pixels
| image.variants       |             |              |              | list of objects       |               | variants of the image.
| image.variants.type  |      x      |      x       |              | type of the variant   |               | type is either 'thumbnail' or 'original'
| draft*               |      x      |              |              | boolean               |   false       | true when the event is a draft ( in which case it can be incomplete )
| private              |             |      x       |              | boolean               |   false       | true if the event access is to be restricted
| accessibility        |             |              |              | list of codes         |    []         | applicable accessibility during the event ( visually impaired, psychic impairment... )
| timezone             |      x      |              |              | text                  |               | timezone of reference ( required event for online events )
| accessTiming*        |             |              |              | text ( code )         |               | describes when, relative to timings, the event can be accessed: 'punctual' or 'flexible'
| timings              |      x      |              |              | list of objects       |               |
| timings.begin        |      x      |              |              | datetime              |               | time when the event begins
| timings.end          |      x      |              |              | datetime              |               | time when the event ends
| age                  |             |              |              | object                |               |
| age.min              |             |              |              | integer               |               | minimum age for intended public
| age.max              |             |              |              | integer               |               | maximum age for intended public
| updatedAt            |      x      |       x      |              | datetime              |               | when the event was last updated
| createdAt            |      x      |       x      |              | datetime              |               | when the event was last created

## Proposed additional fields

 * **creatorUid**: it occasionnally happens that an events change hands. It can be claimed by a user and passed on. Currently, only the ownerId is stored meaning that everytime an ownership change occurs the information of the original event creator is lost.
 * **url**: some events are not associated to a physical location but rather to a virtual one ( i.e. a webinar ). The url serves as virtual location in these cases;
 * **canonicalUrl**: some events have an origin independent from the OpenAgenda platform. In those cases, their representation on OA data formats will come with a canonical reference to the source event. This answers the issue raised by webmasters concerned by the SEO scores of their websites. The canonical url will encourage that any webpage displaying the event content would add a canonical url pointing to the origin website
 * **draft**: feature regularly requested by users on OA. Draft events are partially completed events. Drafts can never be published, but they can be edited by any user having edition rights over the event.
 * **accessTiming**: explicit indication stating how the event can be accessed relative to its timings. 'strict' would mean that an event can only be accessed precisely at the 'begin' time ( a theater play ), 'flexible' would mean that the event is accessible at any time between any given timing begin and end times. In many cases, this can be inferred by other event data ( keywords or single timing spans ), but if this is to be used in event filtering it can be useful to leave the final control to the event owner ( if the event has started and doors are closed, displaying it as an 'ongoing' event the user can go to is flawed ). event form UI can do the inferring, the user can just correct any wrong automatically defined value.


# Methods

## Initialization
Initialize service with db config and schema names. Check **testconfig.sample.js** for details

## List
List events

    svc.list( [ query ], offset, limit, [ options ], ( err, events, [ total ] ) => {

      // total is provided only if total option is true

    } );

###Arguments

 * **query**: filter and sort lists
 * **offset & limit**: offset & limit
 * **options**: see below

###Query

 * **order**: possible values are updatedAt.desc, createdAt.desc, updatedAt.asc, updatedAt.desc
 * **draft**: list draft events in results. Defaults at false. null if draft & non-draft are to be listed, true for drafts only
 * **private**: works like draft but for private events

###Options

 * **total**: get total as second argument of results. Defaults at false
 * **internal**: include internal fields in list results ( like **id** ). See database map file for list of internal values

## Get
Get detailed data on a specific event

###Arguments

* **identifiers**: id or object containing id, uid or slug of event to be fetched
* **options**: see below

###Options

* **internal**: include internal fields in result ( not to be used in browser )
* **includeImagePath**: decorate image values with path
* **private**: defaults at false. If true, gets event only if it is private, if null gets it either way


## Create

Create an event.

    await service.create( data, [ options ]);

or

    service.create( data, [ options ], ( err, result ) => {} );

When successful, returns an object iwith the following keys:

    {
      event, // updated or created event.. or null
      valid, // validity of input data
      success, // true if set was successful
      errors // validation errors or empty array
    }

###Arguments

 * **identifiers**: if set, a create is attempted. Either an id or an object containing uid, slug or id
 * **data**: data for the create / update. Best see set tests and event validator structure for details
 * **options**: see below

### Options

 * **protected**: if true, protected values can be set. defaults at false. See database map file for list of protected values
 * **internal**: if true, internal values are included in result
 * **includeImagePath**: if true, includes image path in result
 * **draft**: if true, validates and sets a draft event. If false, validates and sets a published event. If null, draft value is deduced from data completeness. Default is true.
 * **transferToLegacy**: defaults at false. If true, replicates data in legacy tables


## Update

Update an event.

    await service.update( identifiers, data, [ options ]);

or

    service.update( identifiers, data, [ options ], ( err, result ) => {} );

### Options

 * **transferToLegacy**: defaults at false. If true, replicates data in legacy tables



## Set - deprecated
Create or update an event

    svc.set( [ identifiers ], data, [ options ], ( err, result ) => {

      /*
        result looks like this {
          event, // updated or created event.. or null
          valid, // validity of input data
          success, // true if set was successful
          errors // validation errors or empty array
        }
      */

    } );




## Remove
Delete an event ( soft delete, sets deleted_at field to now  )

    svc.remove( identifiers, ( err, result ) => {

      // result contains success: { success: true }

    } );

### Arguments

Just the identifier of the event to remove. id or { id ] or { uid } or { slug }

## Deleted

Lists the deleted event uids with deletion date, latest deleted first

    svc.deleted( offset, limit, ( err, deleted ) => {

      deleted[ 0 ]; // { uid: 123, deletedAt: [Date object] }

    } );

## Stats
Provide overall service stats

    svc.stats( ( err, stats ) => { } );

## Legacy

Bridge library allowing a **get** from legacy db and permitting to **transfer** from legacy db to this service. Both operations take an identifier as argument ( id or { id }, { uid } or { slug }

## Transfer task

Takes all events from legacy db and updates service dataset. Uses 'transfer' from legacy endpoint.

### Handling of non-published events during transfer

Legacy events have an is_published field as part of their schema. The new schema does not use that field, replacing with a 'draft' field. Following the new schema, draft events can be incomplete, whereas non-draft events cannot. During the transfer, three cases arise to determine the 'draft' value of the translated event:

 * **is_published is false**: draft is set to true
 * **is_published is true, but event is evaluated as being incomplete: draft is set to true
 * ** is_published is true and event is evaluated as being complete: draft is set to false


### Verifying sync

New event service does soft remove, so the correct count verification query should be the following:

Check that events in legacy are also in new service:

    select e.uid, count(e2.uid) as matches from event as e left join event_2 as e2 on e2.uid =e.uid group by e.uid having matches=0;

Check that non-deleted events of new service are also in legacy event table

    select e2.uid, count(e.uid) as matches from event_2 as e2 left join event as e on e2.uid=e.uid where e2.deleted_at is null group by e2.uid having matches=0;

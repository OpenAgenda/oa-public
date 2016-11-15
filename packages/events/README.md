Gérer les 'delete' dans le script de transfer avant intégration.

# Overview

This service provides methods to perform crud operations on events. Other than an origin agenda uid, it does handle any information related to agendas or agenda-decoration data such as tags, categories or custom fields.

Methods include basic crud operations, as well as validation, global stats and a deletion index.

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

## Set
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
 
###Arguments

 * **identifiers**: if set, a create is attempted. Either an id or an object containing uid, slug or id
 * **data**: data for the create / update. Best see set tests and event validator structure for details
 * **options**: see below

###Options

* **protected**: if true, protected values can be set. defaults at false. See database map file for list of protected values
* **internal**: if true, internal values are included in result
*  **includeImagePath**: if true, includes image path in result

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

Takes all events from legacy db and updates service dataset. Uses 'transfer'. Does not handle delete delta yet.
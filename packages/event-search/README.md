# Overview

The event search service. For searching events.


# Initialization

The service needs to be initialized before use. See the `testconfig.sample.js` file for a configuration sample:

    const search = require( 'event-search' );

    const configSample = require( './testconfig.sample.js' );

    search.init( configSample );

    // service is now ready to be used!


# API

## Single index operations

The service allows you to handle an aliased event index through its main interface, a function taking the name of the handled alias:

 * **search( 'alias_name' ).rebuild**: takes an event list function and loops on it to rebuild a search index. Discards the previous one on a successful operation
 * **search( 'alias_name' ).search**: search an index. See tests for more details
 * **search( 'alias_name' ).add**: add an event to an index. See tests for more details
 * **search( 'alias_name' ).update**: update an event ( partial update ).
 * **search( 'alias_name' ).remove**: remove an event from index.


# Handling event operations on multiple indices

When a user updates or removes an event, all agendas where it was published are impacted. On OpenAgenda we will have an event.onRemove hook that will be called which will in turn call the event-search service to be called as well. How does the event-search service know which indices will be impacted?

Same goes for an update, multiple indices can be impacted for an event update, one should be refreshed directly, the others can wait. But the service must know one way or another how indices should be impacted.

// these should exist.
 * search.create // creates an aliased index
 * search.remove // deletes an aliased index
 * search.add // adds an event to multiple indices... the event should be decorated for each index following the specifics ( state, custom fields ) of that index.


 **The update of a single index can take in whatever extra info it requires. Maybe the mapping could be stored in an additional type to avoid constant db calls.**

 Core event updates could be distinguished from reference updates ( like custom fields )
 to avoid update loops. Like a custom field that is updated does not impact event updated_at reference.
 
 So a core event update still calls for a search.update that still needs to update event data in its primary ( origin ) index and then its secondary indices ( through a queue & task )

 A decoration update for an event will need to impact only one index.

 Do I need this for a first deploy? One single index for entire db means ( can be queued ) that only core event updates should be considered. All should be indexed? Not private events nor draft events.

 Next step: integration of event service. Then, integration of search.



# Running Elasticearch 5.1 for development

This is only useful if you are already running another version of elasticsearch as a service and need to launch elasticsearch manually

sudo service elasticsearch stop && cd /usr/share/elasticsearch-5.1.2 && sudo -H -u elasticsearch bash -c './bin/elasticsearch'




FormSchema can be built from current custom fields ?

FormSchema can decorate mapping

A clean interface must be made available for event lifecycle



How are indexes managed?

when an event is updated, it needs to be updated in every index where it is set.

It first needs to be updated in the origin index, then the others. Others can be tasked.

This is neat but a first step could be to setup up a single unified index for the whole db.

search index administration can be handled in event-search, through dedicated endpoint that would
react on event lifecycle happenings; lookup stakeholders, update main index and then queue others ( alias names and event create / update / remove info can be queued )



rebuild can take an alternative mapping... although rebuild should not require mapping, it should fetch the one from the previous index if existing.

A mapping load logic is required prior to rebuild.

1. comes from the outside - at rebuild
2. comes from previous index
3. comes from default service mapping

mapping from the outside is a "decoration" mapping. So the service mapping is always used.


mapping FormSchema-handled types to ES should be possible ( a default mapping ) with reservations





https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-index




# Sorting

By default, the index should be sorted to show events with upcoming timings first and past events second. Then, events with dates nearest to the present should be presented first.

For example here, events will be presented in the following order when listed: 0, 1, 2, 3, 4

    ------------------------ PRESENT ---------------------------> ( timeline )
                                v
                                |
                             [ event 0.............. ]
                                |    [ event 1 ]
                                |               [ ...event 2.. ]
           [ .event 3 ]         |
    [ event 4 ]                 |    


Sorting tests demonstrate how this is achieved with Elasticsearch DSL.


# Filtering timings

Do this next:

https://www.elastic.co/guide/en/elasticsearch/reference/5.x/query-dsl-range-query.html
https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-nested-query.html


# Templates

Elasticsearch templates will not be used for the time being. They may be at some point if they improve readability of the code and do not cause a loss in query building flexibility

https://www.elastic.co/guide/en/elasticsearch/reference/5.x/search-template.html
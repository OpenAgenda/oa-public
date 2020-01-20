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

Load up an index:

    const eventSearch = require( 'event-search' );

    const eventIndex = eventSearch( 'aliasname' );

The service allows you to handle an aliased event index through its main interface, a function taking the name of the handled alias:

 * **eventIndex.name**: in case you forgot the index name
 * **eventIndex.exists()**: says if the index exists
 * **eventIndex.rebuild()**: takes an event list function and loops on it to rebuild a search index. Discards the previous one on a successful operation
 * **eventIndex.delete()**:  delete the index
 * **eventIndex.search()**: search an index. See tests for more details
 * **eventIndex.search.stream()**: search an index using a stream. Tests for details
 * **eventIndex.add()**: add an event to an index. See tests for more details
 * **eventIndex.update()**: update an event ( partial update ).
 * **eventIndex.remove()**: remove an event from index.
 * **eventIndex.moreLikeThis()**: perform a more like this search


# Usage of the service in an integrated environment

The service is only concerned with indexing and retrieving events in and from alias indices. At the creation of an index, it can take custom schemas to add mapping specifics for the created index;

An alias name can easily be derived from the uid of an agenda: **agendas/{uid}**

The integrating application's concern is to know which indices to update when an event is updated. The service itself can provide an endpoint for multiple index update on an event action. Options could differ per index:

    search.update( identifier, data, [ {
      name: 'alias_name',
      options: { queue: true, refresh: false }
    }, ... ]

This way the integrating app keeps control over which indices have to be updated right away and which can be queued.

But depending on the index, the custom data can differ. The update of event core data must be **partial** and exclude .contributor and .custom parts.

To begin with, ES can be used with only one alias defined at integration. ES could be installed on a small instance.



# Extended mappings

Custom fields can be added appended to event schema depending on the index.

By default, the mapping used is the one defined in the service settings, under the mapping key. As a mapping is associated to an index at rebuild, it is at that moment that the mapping extension can be given in its own key:

    service( 'test_alias' ).rebuild( {
      eventsList, // this function should provide extended data for each event
      extensions: {
        custom: {
          some_extra_text_field: {
            type: 'text'
          },
          some_extra_number_field: {
            type: 'integer'
          }
        }
      }
    } );

A parsing function converts a form schema definition into a property set understandable by Elasticsearch.

What about private data? Not indexed to begin with.

When I have my parser, I can define a new index with custom fields.
But I still need to pump data in there.
The data is assembled at the integrated app level
and provided by the eventList function.

eventList will base itself on agenda-events, load base event data for each page, decorate with extended event data and return decorated data for indexing.

How does the event search lifecycle go?

 * an event update: the event.onUpdate interface func is called. There an event-search endPoint triggers
   the update of all impacted indices. How does the service know which indices are impacted? By asking an
   interface function... which will in turn indicate which is the main indice and which are the secondary ones.
   The interface function will base itself on an agendaEvents call as well as the origin agenda ref of the event
   ( agendaUid ).
 * an event reference update: simple - only one index is impacted.

 Stakeholder data? these are not handled at all right now. Plus, a stakeholder update may impact a multitude of events in an index. Like a tag label update. These are handled in a transverse way in an index. As a task.

 Stakeholder data needs to be added to mapping at rebuild. And needs to be updated in a transverse way, with



# Elasticsearch

# Installing an additional version on the same computer

 * Download it in tar or zip format: https://www.elastic.co/downloads/elasticsearch
 * Unzip/tar in /usr/share
 * In your /usr/share/elasticsearch-X.X folder, give ownership of config folder ( and contents ) to elasticsearch user
 * In the config folder edit the elasticsearch.yml as per subsections below
 * Create the data & log folders if they do not yet exist, give rw access to elasticsearch user


## elasticsearch.yml file

```
path.data: /var/lib/elasticsearch-5.3.0
path.logs: /var/log/elasticsearch-5.3.0

http.port: 9205
transport.tcp.port: 9305

action.auto_create_index: false

http.cors.enabled: true
http.cors.allow-origin: "*"
```

The 'auto_create_index' option allows the creation of an index on the fly when a document is added. We do not want that.


# Running Elasticearch for development

This is only useful if you are already running another version of elasticsearch as a service and need to launch elasticsearch manually

sudo service elasticsearch stop && cd /usr/share/elasticsearch-5.3.0 && sudo -H -u elasticsearch bash -c './bin/elasticsearch'

Start is as a process:
sudo -H -u elasticsearch bash -c './bin/elasticsearch -d -p /tmp/pid'

https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-index

https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-16-04



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



# Elasticsearch administration

To remove all indices:

    curl -XDELETE 'http://localhost:9205/_all'

#  Aggregation

Aggregation can be requested at the time of the search:

    let { aggregations } = await service( 'indexName' ).search( /*search*/, /*nav*/, {
      aggregations: [ {
        type: 'terms',
        field: 'location.department'
      } ]
    } );


# Troubleshoot and design considerations

The bulk index has a queue which is limited in size. When that limit is reached during indexing, 429 code errors are returned

A large amount of aliases on the same index are not advised. Hundreds or thousands are ok.
https://discuss.elastic.co/t/performance-of-many-index-aliases/182529/2

Can I have multiple indexes on one shard? -> No
https://bonsai.io/blog/multiple-indices-per-shard.html

A large amount of Shards (1 shard = 1 lucene index instance) is not good.

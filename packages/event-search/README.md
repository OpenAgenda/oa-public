# Overview

The event search service. For searching events.

# Running Elasticearch 5.1 for development

This is only useful if you are already running another version of elasticsearch as a service


cd /usr/share/elasticsearch-5.1.2 && sudo -H -u elasticsearch bash -c './bin/elasticsearch'




FormSchema can be built from current custom fields ? 

FormSchema can decorate mapping

A clean interface must be made available for event lifecycle



How are indexes managed?

when an event is updated, it needs to be updated in every index where it is set.

It first needs to be updated in the origin index, then the others. Others can be tasked.

This is neat but a first step could be to setup up a single unified index for the whole db.

search index administration can be handled in event-search, through dedicated endpoint that would
react on event lifecycle happenings; lookup stakeholders, update main index and then queue others ( alias names and event create / update / remove info can be queued )






https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-index




search_after limitations:

  try sorting by local date string saved as string type

then try adding a sort for end time

then give up and use from/size


Store search templates in cluster state:


https://www.elastic.co/guide/en/elasticsearch/reference/5.x/object.html


TODO:

  // do a dsl query endpoint to be tested
  // against existing and required features.
  // with filters and sort.
  // use dsl test suite to build base mapping
  // then prepare parser.

Pagination: from & to is the simplest:
  
 * should allow for 'search after': https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-search-after.html

 * and 'scroll': https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-scroll.html#scroll-search-context


// switch time from utc midnight to time from local midnight and start building query validator and dsl parser;

Sorting:

It is possible to filter nested items ( timings ) prior to sort, and it is possible to put several sorts.

So first come events with upcoming timings ( based on end of last timing ),
then sort by nearest upcoming date <- ?
then sort by end of last timing


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
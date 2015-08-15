#Aggregator

##Use cases

* An event is published on an agenda > each agenda directly aggregating that agenda should in turn:
  * check if the event is not already listed. if it is:
    * if it has as source declared, push in the new source id
    * it does not have any source declared, do nothing
  * if it is not listed, publish it and add as source

* An event is unpublished from an agenda > each agenda directly aggregating that agenda should in turn:
  * check that the same event is listed
  * check that the event was added by that source and only by that source
  * if added by that source but not only, pop the source from the list of sources
  * if added by that source and only by that source, unlist the event

* An agenda declares another as source: an option can be set to specify if only upcoming events should be added at initialisation or if all events should be added.
  * By default, only upcoming events should be added

##Design

### when an event is published
When an event is added to an agenda, an aggregator method should be called that stacks that information on a process queue ( to avoid unnecessary queries ).

    var aggregator = require( 'aggregator' );
    
    aggregator.notifyPublish( agenda.id, event.id );
    
When the notification is processed, the tasks lists the aggregating agendas and queues the specific jobs:

    evaluatePublish( agenda.id, event.id, aggregator.id );

Each publish on an aggregator is then evaluated and the above-mentioned process takes place.

Roughly the same goes for a remove.

### when an event is unpublished

Well then there is a slight difference: the references of that event are looked at, and those which show the source agenda are removed.

    var aggregator = require( 'aggregator' );
  
    aggregator.notifyUnpublish( agenda.id, event.id );
  
  Then, the same is done with the opposite outcome.


### Adding a source
A source is added to the agenda via a method exposed by the agenda service. The source is added by the aggregation library. Once the source is added, the events must be indexed by the aggregating agenda:

    var aggregator = require( 'aggregator' );

    aggregator.createSource( agenda.id, aggregatorAgenda.id, upcomingOnly, cb );
   
 The upcomingOnly option is by default true and indicates that the events to be added to the aggregator are only the ones that are upcoming. The method queues that operation, and when processed, events of the source agenda are streamed to be published through *evaluatePublish*.

### when a source is removed
Well right now, when a source is removed from an aggregator, nothing happens. The events having been aggregated stay published on the aggregator.

The aggregator module will be a service in the app that will make use of the agenda & event services.


> Written with [StackEdit](https://stackedit.io/).

# Overview

Aggregation functionality. Upcoming.

## Resync script

The script is given an aggregator identifier and triggers the re-evaluation of published events in the aggregation tree.

 * build a list of all nodes of the tree identifying head, node, leaves and relations
 * for each agenda in the list at the exception of the head, list agenda-event references for published events and enqueue in intermediate queue ( prepare stats )
 * process intermediate queue to call interface function for each item


## Use cases

 * La métropole de bordeaux veux agréger depuis l'agenda officiel NDM les événements qui correspondent à leur communes; un filtre OU sur plusieurs données lieu.

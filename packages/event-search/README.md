# Overview

The event search service. For searching events.

## Examples

Filter events of a set by their origin agenda and last update date:

    const { events, total } = await eventSearch('setidentifier').search({
      originAgendaUid: 12908493,
      updatedAt: {
        gte: new Date('2020-10-19')
      }
    });


## Filters

 * `featured`: defaults at null. if true, only featured events are in response. false for the opposite.
## Options

Loaded in the third argument.

 * `monolingual`: flatten multilingual field values in response
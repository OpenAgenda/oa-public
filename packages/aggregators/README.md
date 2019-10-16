# Overview

## Instance

Aggregator methods are provided by an instance created by a createInstance provided by the service.

    const { createInstance } = require('@openagenda/aggregators');

    const agg = createInstance({
      queues,
      knex,
      interfaces: {
        referenceEvent,
        unreferenceEvent,
        getMergedSchema,
        loadEvent,
        getEventReference,
        listEventReferences,
        setSourceUidOnExistingReference,
        unsetSourceUidOnExistingReference
      }
    });

## Instance methods

### notify

Notify the instance that an event state changed, was added to or removed from an agenda. The instance then proceeds to queue an aggregation evaluation

    await agg.notify(type, data);

### set

Set (update or create) an aggregator reference with a set of rules. See Rules section for more details on rules.

    await agg.set(agendaUid, { rules: [] });

### remove

Remove an aggregator reference. The associated agenda will not aggregate events anymore, aggregator sources are removed at the same time

    await agg.remove(agendaUid);

### sources.list

List the sources of an aggregator.

    await agg.sources.list(agenda, [agendaTitleSearch], { detailed });

Returns a list of sources `[{id, agendaUid, rules }]`.

Second argument is the query for matching agendas by their title
Third contains detailed boolean as option.

If a search is provided or detailed is true, agenda is placed in an agenda key in the result source items

### sources.add

Adds a source to an aggregator

    await agg.sources.add(aggregatorAgenda, sourceAgenda, rules);

### sources.remove

Removes a source from an aggregator

    await agg.sources.remove(aggregatorAgenda, sourceAgenda)

### sources.update

Update an aggregator source

    await agg.sources.update(sourceId, rules);

### task

Runs aggregation tasks. As most aggregation processing is queued, the task function must be run somewhore

## Rules

They are processed when an event is evaluated for aggregation. They are stored either in the aggregator or the source in the store field as a list under the `rules` key.

Each rule can have the following values:

 * `query`: determines whether the rule matches or not
 * `required`: defaults to true, determines if the rule is required for aggregating the event
 * `transform`: changes ( using immutability helper synthax ) to bring to provided value when the query matches


## Aggregation filter examples

An aggregator that filters events from a list of city names

```
{
  "rules": [
    {
      "query": {
        "location": [
          {
            "city": "Ambarès-et-Lagrave"
          },
          {
            "city": "Ambès"
          },
          {
            "city": "Artigues-près-Bordeaux"
          },
          {
            "city": "Bassens"
          },
          {
            "city": "Bègles"
          },
          {
            "city": "Blanquefort"
          },
          {
            "city": "Bordeaux"
          },
          {
            "city": "Bouliac"
          },
          {
            "city": "Le Bouscat"
          },
          {
            "city": "Bruges"
          },
          {
            "city": "Carbon-Blanc"
          },
          {
            "city": "Cenon"
          },
          {
            "city": "Eysines"
          },
          {
            "city": "Floirac"
          },
          {
            "city": "Gradignan"
          },
          {
            "city": "Le Haillan"
          },
          {
            "city": "Lormont"
          },
          {
            "city": "Martignas-sur-Jalle"
          },
          {
            "city": "Mérignac"
          },
          {
            "city": "Parempuyre"
          },
          {
            "city": "Pessac"
          },
          {
            "city": "Saint-Aubin-de-Médoc"
          },
          {
            "city": "Saint-Louis-de-Montferrand"
          },
          {
            "city": "Saint-Médard-en-Jalles"
          },
          {
            "city": "Saint-Vincent-de-Paul"
          },
          {
            "city": "Le Taillan-Médoc"
          },
          {
            "city": "Talence"
          },
          {
            "city": "Villenave-d'Ornon"
          }
        ]
      }
    }
  ]
}

```

An aggregator that makes source tag values correspond to aggregator tag values
```
{
  "rules": [
    {
      "transform": {
        "tags": {
          "$set": []
        }
      }
    },
    {
      "query": {
        "tags": "Cinéma - projection"
      },
      "transform": {
        "tags": {
          "$push": [
            "Cinéma"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Concert"
      },
      "transform": {
        "tags": {
          "$push": [
            "Musique"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Evénement sportif"
      },
      "transform": {
        "tags": {
          "$push": [
            "Sport"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Fête / festival"
      },
      "transform": {
        "tags": {
          "$push": [
            "Fête - Festival"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Marché / braderie"
      },
      "transform": {
        "tags": {
          "$push": [
            "Braderie - Brocante"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Nature / environnement"
      },
      "transform": {
        "tags": {
          "$push": [
            "Développement durable"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Rencontre / conférence / débat"
      },
      "transform": {
        "tags": {
          "$push": [
            "Conférence - Rencontre"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Stages et ateliers"
      },
      "transform": {
        "tags": {
          "$push": [
            "Atelier"
          ]
        }
      },
      "required": false
    },
    {
      "query": {
        "tags": "Visite"
      },
      "transform": {
        "tags": {
          "$push": [
            "Visite - Balade"
          ]
        }
      },
      "required": false
    }
  ]
}
```


An aggregator that filters on a city and adapts tags

```
{
  "rules" : [ {
    "query" : {
      "location" : [ {
        "city" : "Villeneuve-d'Ascq"
      } ]
    },
    "transform" : {
      "tags" : {
        "$push" : [ "Journées Européennes du Patrimoine" ]
      }
    },
    "required" : true
  }, {
    "query" : {
      "tags" : "Animation Jeune public"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Animation" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Animation pour scolaires / Levez les yeux"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Animation" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Circuit"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Visite - Balade" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Concert"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Musique" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Exposition"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Exposition" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Fouille archéologique"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Atelier" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Projection"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Cinéma" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Spectacle / Lecture"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Spectacle" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Visite libre"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Visite - Balade" ]
      }
    },
    "required" : false
  }, {
    "query" : {
      "tags" : "Visite commentée / Conférence"
    },
    "transform" : {
      "tags": {
        "$push" : [ "Visite - Balade" ]
      }
    },
    "required" : false
  } ]
}
```

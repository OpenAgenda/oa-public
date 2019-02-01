# Overview

Event form app using a form-schemas component.


## About event references field

The reference field is part of the event standard model but is used only when included by a schema extension. The extension always defines an abstract field that includes the options of the reference field. These can be:

 * **suggest** : false by default. If true, will provide a link that will load similar events, by default by comparing title, description and location fields
 * **related** : an optional list of field name that are to be used for automatic suggestions
 * **boost** an optional object with field names as keys with a score assigned at each key. These allow ponderated suggestions. The more a field is associated with a high boost score, the more will it count for determining suggestions.

An example configuration:

    {
      "field": "references",
      "fieldType": "abstract",
      "boost": {
        "type-devenement": 30,
        "publics-cibles": 20,
        "location": 10
      },
      "related": [
        "type-devenement",
        "publics-cibles",
        "location"
      ],
      "suggest": true
    }

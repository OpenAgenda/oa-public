# Overview

This services provides functionality useful for form-builder UIs.

The base object it handles is a form-schema object, which bundles list of field definitions associating each of them with the required info for displaying them as a form item and instanciating the matching validator ( from validators lib ).

Base functionality include:

 * an iso form field validator telling you if the input field definition is valid
 * an iso form schema instance with useful getters and setters to handle an form-shcema object
 * service crud operations to set, get and delete form schemas

# Validation

 * Validate this...

# Instance

## Methods

This is a quick summary. For details, check tests: `test/FormSchema.js`

 * **isNew()**: true if a FormSchema is new
 * **isEmpty()**: true if a FormSchema is empty
 * **addField( fieldData )**: adds a field to the schema
 * **getFieldCount()**: gives the number of fields
 * **getField( index ): gets a field by its position index in schema
 * **moveField( index, moves ): moves field up or down in the schema by given number of moves. Minus goes up, plus goes down
 * **removeField( index ): remove field from schema 

# Legacy bridge

On the legacy platform, custom field schemas are stored in the agenda data model. A legacy bridge function can parse those to form a FormSchema that can be validated. Otherwise it just throws an error.

## Tests

category set in get test looks like this:

    {
      "categories": [
        {
          "id": 626,
          "label": "Pratique du handball",
          "slug": "pratique-du-handball"
        },
        {
          "id": 627,
          "label": "Découverte du handball",
          "slug": "decouverte-du-handball"
        },
        {
          "id": 628,
          "label": "Culture",
          "slug": "culture"
        },
        {
          "id": 629,
          "label": "Éducation",
          "slug": "education"
        },
        {
          "id": 630,
          "label": "Événement festif / promotion",
          "slug": "evenement-festif-promotion"
        },
        {
          "id": 631,
          "label": "Autres",
          "slug": "autres"
        },
        {
          "id": 908,
          "label": "Santé par le handball",
          "slug": "sante-par-le-handball"
        },
        {
          "id": 909,
          "label": "Citoyenneté",
          "slug": "citoyennete"
        },
        {
          "id": 910,
          "label": "Solidarité par le handball",
          "slug": "solidarite-par-le-handball"
        },
        {
          "id": 911,
          "label": "Développement durable",
          "slug": "developpement-durable"
        },
        {
          "id": 912,
          "label": "Insertion sociale et professionelle",
          "slug": "insertion-sociale-et-professionelle"
        }
      ],
      "name": "Thème",
      "info": " ",
      "required": true
    }

custom set in get test looks like this ( 5 fields ):

    [
      {
        "name": "phenomenal",
        "fieldType": "textarea",
        "type": "public",
        "optional": false,
        "label": {
          "fr": "Quelle action allez-vous mettre en place pour faire la promotion du mondial 2017?",
          "en": "what actions are you going to set in place to promote the world cup 2017?"
        },
        "info": {
          "fr": "quelques exemples d’actions phénoménales : faire participer les licenciés présents à votre évènement à la mosaïque, stand d’information sur la billetterie mondial…",
          "en": "quelques exemples d’actions phénoménales : faire participer les licenciés présents à votre évènement à la mosaïque, stand d’information sur la billetterie mondial…"
        }
      },
      {
        "name": "quisuisje",
        "fieldType": "radio",
        "type": "public",
        "optional": false,
        "label": {
          "fr": "Qui suis-je?"
        },
        "options": [
          {
            "label": {
              "fr": "Clubs"
            },
            "value": "club"
          },
          {
            "label": {
              "fr": "Comités"
            },
            "value": "comite"
          },
          {
            "label": {
              "fr": "Ligues"
            },
            "value": "ligue"
          },
          {
            "label": {
              "fr": "Clubs / Comités"
            },
            "value": "clubcomite"
          },
          {
            "label": {
              "fr": "Clubs / Ligues"
            },
            "value": "clubligue"
          },
          {
            "label": {
              "fr": "Comités / Ligues"
            },
            "value": "comiteligue"
          },
          {
            "label": {
              "fr": "Fédérations scolaires et universitaires : UNSS"
            },
            "value": "unss"
          },
          {
            "label": {
              "fr": "Fédérations scolaires et universitaires : USEP"
            },
            "value": "usep"
          },
          {
            "label": {
              "fr": "Fédérations scolaires et universitaires : éducation nationale"
            },
            "value": "edunat"
          },
          {
            "label": {
              "fr": "Fédérations scolaires et universitaires : UGSEL"
            },
            "value": "ugsel"
          },
          {
            "label": {
              "fr": "Fédérations scolaires et universitaires : FFSU"
            },
            "value": "ffsu"
          },
          {
            "label": {
              "fr": "Autre association sportive"
            },
            "value": "AutreAssociationSportive"
          },
          {
            "label": {
              "fr": "Association étudiante"
            },
            "value": "AssoEtudiante"
          },
          {
            "label": {
              "fr": "École"
            },
            "value": "Ecole"
          },
          {
            "label": {
              "fr": "Collectivité"
            },
            "value": "Collectivite"
          },
          {
            "label": {
              "fr": "Association culturelle"
            },
            "value": "AssoCulturelle"
          },
          {
            "label": {
              "fr": "Bar-restaurant-boîte de nuit"
            },
            "value": "BarRestoBoite"
          },
          {
            "label": {
              "fr": "Entreprises"
            },
            "value": "Entreprises"
          },
          {
            "label": {
              "fr": "Autre"
            },
            "value": "Autre"
          }
        ]
      },
      {
        "name": "partners",
        "type": "public",
        "fieldType": "text",
        "optional": true,
        "max": 300,
        "label": {
          "fr": "Partenaires"
        }
      },
      {
        "name": "participants",
        "type": "private",
        "fieldType": "integer",
        "optional": false,
        "label": {
          "fr": "Nombre de participants attendus"
        }
      },
      {
        "name": "citation",
        "type": "private",
        "fieldType": "textarea",
        "optional": false,
        "max": 3000,
        "label": {
          "fr": "Quelle est la promesse phénoménale faite aux participants"
        }
      }
    ]

tag set in get test looks like this ( 2 groups ):

    {
      "groups": [
        {
          "name": "Public ciblé",
          "info": " ",
          "tags": [
            {
              "id": 3115,
              "label": "Jeunes",
              "slug": "jeunes"
            },
            {
              "id": 3116,
              "label": "Séniors",
              "slug": "seniors"
            },
            {
              "id": 3117,
              "label": "Résidents quartier prioritaire politique de la ville ou zone de revitalisation rurale",
              "slug": "residents-quartier-prioritaire-politique-de-la-ville-ou-zone-de-revitalisation-rurale"
            },
            {
              "id": 3118,
              "label": "Personnes en situation de handicap",
              "slug": "personnes-en-situation-de-handicap"
            },
            {
              "id": 3119,
              "label": "Public isolé en difficulté sociale",
              "slug": "public-isole-en-difficulte-sociale"
            }
          ],
          "required": true
        },
        {
          "name": "Êtes-vous candidat à la labellisation \"Tous Prêts\"?",
          "info": "Pour plus d'information: http://tousprets.sports.gouv.fr/",
          "tags": [
            {
              "id": 3318,
              "label": "Nous sommes candidats à la labellisation!",
              "slug": "nous-sommes-candidats-a-la-labellisation"
            }
          ],
          "required": false
        }
      ]
    }
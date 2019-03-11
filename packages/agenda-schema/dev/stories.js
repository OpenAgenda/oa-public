"use strict";

const _ = require( 'lodash' );

module.exports = [ {
  name: 'Main',
  description: 'This is the only story for now',
  slug: 'main',
  config: {
    interfaces: {
      getAgenda: async ( { slug } ) => {
        return { title: 'Grut' };
      },
      getSchemas: async ( ) => {
        return {
          schema: null,
          extensions: [ {
            "schema": {
              "custom": {},
              "fields": [
                {
                  "field": "image",
                  "fieldType": "image",
                  "optional": true,
                  "label": {
                    "fr": "Image de l'événement",
                    "en": "Image of the event"
                  },
                  "info": {
                    "fr": "Chargez une image d'au moins 300 pixels de large",
                    "en": "Load an image of at least 300 pixels width"
                  },
                  "extensions": [
                    "jpg",
                    "bmp",
                    "png",
                    "jpeg"
                  ]
                },
                {
                  "field": "imageCredits",
                  "fieldType": "text",
                  "optional": true,
                  "label": {
                    "fr": "Crédits de l'image",
                    "en": "Image credits"
                  },
                  "enableWith": "image"
                },
                {
                  "field": "languages",
                  "fieldType": "languages",
                  "label": {
                    "fr": "Choisissez une langue",
                    "en": "Pick a language"
                  }
                },
                {
                  "languages": [],
                  "field": "title",
                  "fieldType": "text",
                  "optional": false,
                  "max": 140,
                  "label": {
                    "fr": "Titre",
                    "en": "Title"
                  },
                  "placeholder": {
                    "fr": "Le titre de votre événement",
                    "en": "Title of your event"
                  },
                  "sub": {
                    "fr": "",
                    "en": ""
                  }
                },
                {
                  "languages": [],
                  "field": "description",
                  "fieldType": "text",
                  "optional": false,
                  "max": 200,
                  "label": {
                    "fr": "Description courte",
                    "en": "Short description"
                  },
                  "placeholder": {
                    "fr": "Une courte description de votre événement",
                    "en": "A short description of your event"
                  },
                  "sub": {
                    "fr": "",
                    "en": ""
                  }
                },
                {
                  "languages": [],
                  "field": "keywords",
                  "fieldType": "keywords",
                  "optional": true,
                  "max": 255,
                  "label": {
                    "fr": "Mots clés",
                    "en": "Keywords"
                  },
                  "placeholder": {
                    "fr": "Séparez les mots clés par des tabulation ou des virgules",
                    "en": "Separate each keyword with tabs or commas"
                  },
                  "sub": {
                    "fr": "Les mots clés sont utiles pour les fonctions de recherche",
                    "en": "Keywords are useful for search features"
                  }
                },
                {
                  "languages": [],
                  "field": "longDescription",
                  "fieldType": "markdown",
                  "label": {
                    "fr": "Description longue",
                    "en": "Long description"
                  },
                  "max": 10000,
                  "sub": {
                    "fr": "",
                    "en": ""
                  },
                  "placeholder": {
                    "fr": "Saisissez une description détaillée de votre événement.",
                    "en": "Type in a detailed description of your event."
                  }
                },
                {
                  "languages": [],
                  "field": "conditions",
                  "fieldType": "text",
                  "label": {
                    "fr": "Conditions de participation, tarifs",
                    "en": "Attendence conditions, pricing"
                  },
                  "max": 255,
                  "sub": {
                    "fr": "",
                    "en": ""
                  }
                },
                {
                  "field": "age",
                  "fieldType": "age",
                  "optional": true,
                  "label": {
                    "fr": "Age du public ciblé",
                    "en": "Targeted public age"
                  }
                },
                {
                  "field": "registration",
                  "fieldType": "registration",
                  "optional": true,
                  "label": {
                    "fr": "Outils d'inscription",
                    "en": "Registration"
                  },
                  "placeholder": {
                    "fr": "Séparez les items par des tabulation ou des virgules",
                    "en": "Separate each item with tabs or commas"
                  },
                  "sub": {
                    "fr": "Liens, emails ou numéros de téléphone",
                    "en": "Links, emails or phone numbers"
                  }
                },
                {
                  "field": "accessibility",
                  "fieldType": "accessibility",
                  "optional": true,
                  "label": {
                    "fr": "Accessibilité particulière",
                    "en": "Accessibility conditions"
                  }
                },
                {
                  "field": "location",
                  "fieldType": "location",
                  "optional": false,
                  "label": {
                    "fr": "Lieu",
                    "en": "Location"
                  },
                  "sub": {
                    "fr": "Si aucun lieu ne correspond à votre saisie, ajoutez-le en cliquant sur 'Créer un lieu'",
                    "en": "If no location matches the name, add a new location by clicking on 'Create a new location'"
                  }
                },
                {
                  "field": "timings",
                  "fieldType": "timings",
                  "optional": false,
                  "label": {
                    "fr": "Horaires",
                    "en": "Timings"
                  },
                  "info": {
                    "fr": "Définissez les horaires de votre événement",
                    "en": "Specify timings for your event"
                  },
                  "helpLink": "https://openagenda.zendesk.com/hc/fr/articles/202667461-Saisir-les-horaires-de-votre-%C3%A9v%C3%A9nement"
                }
              ]
            },
            "info": {
              "label": {
                "en": "Standard",
                "fr": "Standard"
              },
              "detail": {
                "en": "Standard event field",
                "fr": "Champ événement standard"
              }
            }
          } ]
        }
      }
    }
  },
  req: {
    lang: 'fr'
  }
} ]

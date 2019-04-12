"use strict";

const ih = require( 'immutability-helper' );

const storyDefaults = require( './defaults' );

module.exports = {
  interfaces: {
    getAgenda: async ( { slug } ) => ih( storyDefaults.agenda, {
      credentials: {
        premiumCustomFields: { $set: false }
      }
    } ),
    getSchema: async agenda => schema,
    getSchemaExtensions: async agenda => extensions,
    setSchemaFields: storyDefaults.setSchemaFields
  }
}

const extensions = {
  "event": {
    "id": -1,
    "custom": {},
    "fields": [
      {
        "field": "image",
        "fieldType": "image",
        "optional": true,
        "label": {
          "fr": "Image de l'événement",
          "en": "Image of the event",
          "it": "Immagine dell'evento",
          "de": "Bild der Veranstaltung"
        },
        "info": {
          "fr": "Chargez une image d'au moins 300 pixels de large",
          "en": "Load an image of at least 300 pixels width",
          "it": "Carica un'immagine di almeno 300 pixel di larghezza",
          "de": "Laden Sie ein Bild mit einer Breite von mindestens 300 Pixeln."
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
          "en": "Image credits",
          "it": "Crediti d'immagine",
          "de": "Bildnachweise"
        },
        "enableWith": "image"
      },
      {
        "field": "languages",
        "fieldType": "languages",
        "label": {
          "fr": "Langues de saisie",
          "en": "Input languages",
          "it": "Scegli una lingua",
          "de": "Wählen Sie eine Sprache"
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
          "en": "Title",
          "it": "Titolo",
          "de": "Titel"
        },
        "placeholder": {
          "fr": "Le titre de votre événement",
          "en": "Title of your event",
          "it": "Il titolo del tuo evento",
          "de": "Titel Ihrer Veranstaltung"
        },
        "sub": {
          "fr": "",
          "en": "",
          "it": "",
          "de": ""
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
          "en": "Short description",
          "it": "Breve descrizione",
          "de": "Kurzbeschreibung"
        },
        "placeholder": {
          "fr": "Une courte description de votre événement",
          "en": "A short description of your event",
          "it": "Una breve descrizione del vostro evento",
          "de": "Eine kurze Beschreibung Ihrer Veranstaltung"
        },
        "sub": {
          "fr": "",
          "en": "",
          "it": "",
          "de": ""
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
          "en": "Keywords",
          "it": "Parole Chiave",
          "de": "Schlüsselwörter"
        },
        "placeholder": {
          "fr": "Séparez les mots clés par des tabulations ou des virgules",
          "en": "Separate each keyword with tabs or commas",
          "it": "Parole chiave separate con schede o virgole",
          "de": "Trennen Sie jedes Keyword durch Tabulatoren oder Kommas."
        },
        "sub": {
          "fr": "Les mots clés sont utiles pour les fonctions de recherche",
          "en": "Keywords are useful for search features",
          "it": "Le parole chiave sono utili per le funzioni di ricerca",
          "de": "Keywords sind nützlich für Suchfunktionen."
        }
      },
      {
        "languages": [],
        "field": "longDescription",
        "fieldType": "markdown",
        "label": {
          "fr": "Description longue",
          "en": "Long description",
          "it": "Descrizione lunga",
          "de": "Lange Beschreibung"
        },
        "max": 10000,
        "sub": {
          "fr": "",
          "en": "",
          "it": "",
          "de": ""
        },
        "placeholder": {
          "fr": "Saisissez une description détaillée de votre événement.",
          "en": "Type in a detailed description of your event.",
          "it": "Inserisci una descrizione dettagliata del tuo evento.",
          "de": "Geben Sie eine detaillierte Beschreibung Ihrer Veranstaltung ein."
        }
      },
      {
        "languages": [],
        "field": "conditions",
        "fieldType": "text",
        "label": {
          "fr": "Conditions de participation, tarifs",
          "en": "Attendence conditions, pricing",
          "it": "Condizioni di partecipazione, prezzi",
          "de": "Teilnahmebedingungen, Preisgestaltung"
        },
        "max": 255,
        "placeholder": {
          "fr": "Entrée libre, sur inscription, autre...",
          "en": "Free access, registration required, other...",
          "it": "Ingresso libero, su registrazione, altro.....",
          "de": "Freier Zugang, Registrierung erforderlich, andere....."
        },
        "sub": {
          "fr": "",
          "en": "",
          "it": "",
          "de": ""
        }
      },
      {
        "field": "age",
        "fieldType": "age",
        "optional": true,
        "label": {
          "fr": "Age du public ciblé",
          "en": "Targeted public age",
          "it": "Età del pubblico di riferimento",
          "de": "Gezieltes öffentliches Alter"
        }
      },
      {
        "field": "registration",
        "fieldType": "registration",
        "optional": true,
        "label": {
          "fr": "Outils d'inscription",
          "en": "Registration",
          "it": "Strumenti di registrazione",
          "de": "Registrierung"
        },
        "info": {
          "fr": "Liens, emails ou numéros de téléphone",
          "en": "Links, emails or phone numbers",
          "it": "Link, e-mail o numeri di telefono",
          "de": "Links, E-Mails oder Telefonnummern"
        },
        "sub": {
          "fr": "Séparez les items par des tabulations ou des virgules",
          "en": "Separate each item with tabs or commas",
          "it": "Separare le voci per tabulazione o virgole",
          "de": "Trennen Sie jedes Element mit Tabs oder Kommas."
        }
      },
      {
        "field": "accessibility",
        "fieldType": "accessibility",
        "optional": true,
        "label": {
          "fr": "Accessibilité particulière",
          "en": "Accessibility conditions",
          "it": "Accessibilità speciale",
          "de": "Bedingungen für die Zugänglichkeit"
        }
      },
      {
        "field": "location",
        "fieldType": "location",
        "optional": false,
        "label": {
          "fr": "Lieu",
          "en": "Location",
          "it": "Posizione",
          "de": "Ort"
        },
        "sub": {
          "fr": "Si aucun lieu ne correspond à votre saisie, ajoutez-le en cliquant sur 'Créer un lieu'",
          "en": "If no location matches the name, add a new location by clicking on 'Create a new location'",
          "it": "Se nessun luogo corrisponde alla tua voce, aggiungilo cliccando su 'Crea un luogo'.",
          "de": "Wenn kein Standort mit dem Namen übereinstimmt, fügen Sie einen neuen Standort hinzu, indem Sie auf \"Neuen Standort erstellen\" klicken."
        }
      },
      {
        "field": "timings",
        "fieldType": "timings",
        "optional": false,
        "label": {
          "fr": "Horaires",
          "en": "Timings",
          "it": "Orari",
          "de": "Timings"
        },
        "info": {
          "fr": "Définissez les horaires de votre événement",
          "en": "Specify timings for your event",
          "it": "Definire gli orari del vostro evento",
          "de": "Festlegen von Zeitplänen für Ihre Veranstaltung"
        },
        "helpLink": "https://openagenda.zendesk.com/hc/fr/articles/202667461-Saisir-les-horaires-de-votre-%C3%A9v%C3%A9nement"
      }
    ]
  },
  "network": null
}


const schema = {
  "custom": null,
  "defaultLabelLanguage": null,
  "nextOptionId": 1,
  "fields": [
    {
      "field": "image",
      "label": {
        "fr": "Image de l'événement",
        "en": "Image of the event",
        "it": "Immagine dell'evento",
        "de": "Bild der Veranstaltung"
      },
      "info": {
        "fr": "Chargez une image d'au moins 300 pixels de large",
        "en": "Load an image of at least 300 pixels width",
        "it": "Carica un'immagine di almeno 300 pixel di larghezza",
        "de": "Laden Sie ein Bild mit einer Breite von mindestens 300 Pixeln."
      },
      "display": false,
      "fieldType": "abstract"
    },
    {
      "field": "imageCredits",
      "label": {
        "fr": "Crédits de l'image",
        "en": "Image credits",
        "it": "Crediti d'immagine",
        "de": "Bildnachweise"
      },
      "display": false,
      "fieldType": "abstract"
    },
    {
      "field": "languages",
      "fieldType": "abstract"
    },
    {
      "field": "title",
      "fieldType": "abstract"
    },
    {
      "field": "description",
      "fieldType": "abstract"
    },
    {
      "field": "keywords",
      "label": {
        "fr": "Mots clés",
        "en": "Keywords",
        "it": "Parole Chiave",
        "de": "Schlüsselwörter"
      },
      "sub": {
        "fr": "Les mots clés sont utiles pour les fonctions de recherche",
        "en": "Keywords are useful for search features",
        "it": "Le parole chiave sono utili per le funzioni di ricerca",
        "de": "Keywords sind nützlich für Suchfunktionen."
      },
      "placeholder": {
        "fr": "Séparez les mots clés par des tabulations ou des virgules",
        "en": "Separate each keyword with tabs or commas",
        "it": "Parole chiave separate con schede o virgole",
        "de": "Trennen Sie jedes Keyword durch Tabulatoren oder Kommas."
      },
      "display": false,
      "fieldType": "abstract"
    },
    {
      "field": "longDescription",
      "fieldType": "abstract"
    },
    {
      "field": "conditions",
      "fieldType": "abstract"
    },
    {
      "field": "age",
      "label": {
        "fr": "Age du public ciblé",
        "en": "Targeted public age",
        "it": "Età del pubblico di riferimento",
        "de": "Gezieltes öffentliches Alter"
      },
      "display": false,
      "fieldType": "abstract"
    },
    {
      "field": "registration",
      "label": {
        "fr": "Outils d'inscription",
        "en": "Registration",
        "it": "Strumenti di registrazione",
        "de": "Registrierung"
      },
      "info": {
        "fr": "Liens, emails ou numéros de téléphone",
        "en": "Links, emails or phone numbers",
        "it": "Link, e-mail o numeri di telefono",
        "de": "Links, E-Mails oder Telefonnummern"
      },
      "sub": {
        "fr": "Séparez les items par des tabulations ou des virgules",
        "en": "Separate each item with tabs or commas",
        "it": "Separare le voci per tabulazione o virgole",
        "de": "Trennen Sie jedes Element mit Tabs oder Kommas."
      },
      "display": false,
      "fieldType": "abstract"
    },
    {
      "field": "accessibility",
      "label": {
        "fr": "Accessibilité particulière",
        "en": "Accessibility conditions",
        "it": "Accessibilità speciale",
        "de": "Bedingungen für die Zugänglichkeit"
      },
      "display": false,
      "fieldType": "abstract"
    },
    {
      "field": "location",
      "fieldType": "abstract"
    },
    {
      "field": "timings",
      "fieldType": "abstract"
    }
  ],
  "id": 94
}

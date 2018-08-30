"use strict";

const _ = require( 'lodash' );

module.exports = ( { locationRes, languages } ) => {

  return {
    custom: {
      registration: require( './registration' ),
      age: require( './age' ),
      keywords: require( './keywords' ),
      timings: require( './timings' ),
      locationUid: require( './locationUid' ),
      languages: require( './languages' )
    },
    fields: [ {
      "field" : "languages",
      "fieldType" : "languages",
      "label" : {
        "fr" : "Choisissez une langue",
        "en" : "Pick a language"
      }
    }, {
      languages,
      "field" : "title",
      "fieldType" : "text",
      "optional" : false,
      "label" : {
        "fr" : "Titre",
        "en" : "Title"
      },
      "max" : 140,
      "placeholder" : {
        "fr" : "Le titre de votre événement",
        "en" : "Title of your event"
      },
      "sub": {
        "fr" : "Ce champ est requis.",
        "en" : "This field is required"
      }
    }, {
      languages,
      "field" : "description",
      "fieldType" : "text",
      "optional" : false,
      "label" : {
        "fr" : "Description courte",
        "en" : "Short description"
      },
      "placeholder" : {
        "fr" : "Une courte description de votre événement",
        "en" : "A short description of your event"
      },
      "sub": {
        "fr" : "Ce champ est requis.",
        "en" : "This field is required"
      }
    }, {
      languages,
      field: 'keywords',
      fieldType: 'keywords',
      optional: true,
      max: 255,
      label: {
        fr: 'Mots clés',
        en: 'Keywords'
      },
      placeholder: {
        fr: 'Séparez les mots clés par des tabulation ou des virgules',
        en: 'Separate each keyword with tabs or commas'
      },
      "sub": {
        "fr" : "Les mots clés sont utiles pour les fonctions de recherche",
        "en" : "Keywords are useful for search features"
      }
    }, {
      languages,
      "field" : "longDescription",
      "fieldType" : "markdown",
      "label" : {
        "fr" : "Description longue",
        "en" : "Long description"
      },
      "sub" : {
        "fr" : "Ce champ ne doit pas exceder 10000 caractères",
        "en" : "This field should not exceed 10000 characters"
      },
      "placeholder" : {
        "fr" : "Soignez la mise en forme",
        "en" : "Make things pretty"
      }
    }, {
      languages,
      "field" : "conditions",
      "fieldType" : "text",
      "label" : {
        "fr" : "Conditions de participation, tarifs",
        "en" : "Attendence conditions, pricing"
      },
      "sub" : {
        "fr" : "Tel format est accepté",
        "en" : "Some specific format is accepted"
      }
    }, {
      field: 'age',
      fieldType: 'age',
      optional: true,
      label: {
        fr: 'Age du public ciblé',
        en: 'Age of the targeted public'
      }
    }, {
      field: 'registration',
      fieldType: 'registration',
      optional: true,
      label: {
        fr: 'Outils d\'inscription',
        en: 'Registration'
      },
      placeholder: {
        fr: 'Séparez les items par des tabulation ou des virgules',
        en: 'Separate each item with tabs or commas'
      },
      sub: {
        fr: 'Liens, emails ou numéros de téléphone',
        en: 'Links, emails or phone numbers'
      }
    }, {
      field: 'locationUid',
      fieldType: 'locationUid',
      optional: false,
      label: {
        fr: 'Lieu',
        en: 'Location'
      },
      info: {
        fr: 'Saisissez le nom du lieu où se déroule l\'événement',
        en: 'Type in the name of the location where the event takes place'
      },
      sub: {
        fr: 'Si aucun lieu ne correspond à votre saisie, ajoutez-le en cliquant sur \'Créer un lieu\'',
        en: 'If no location matches the name, add a new location by clicking on \'Create a new location\''
      },
      res: _.assign( {
        index: '#locations',
        geocode: '#locations/geocode',
        set: '#locations',
        remove: '#locations/remove'
      }, locationRes || {} )
    }, {
      field: 'timings',
      fieldType: 'timings',
      optional: false,
      label: {
        fr: 'Horaires',
        en: 'Timings'
      },
      info: {
        fr: 'Définissez les horaires de votre événement',
        en: 'Specify timings for your event'
      }
    } ]
  }

}

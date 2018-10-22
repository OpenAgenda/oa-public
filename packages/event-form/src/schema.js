"use strict";

const _ = require( 'lodash' );

const eventValidators = {
  registration: require( './validators/registration' ),
  age: require( './validators/age' ),
  accessibility: require( './validators/accessibility' ),
  keywords: require( './validators/keywords' ),
  timings: require( './validators/timings' ),
  locationUid: require( './validators/locationUid' ),
  languages: require( './validators/languages' ),
  references: require( './validators/references' )
}

const merge = require( '@openagenda/form-schemas/client/build/iso/merge' );

const eventReferencesField = require( './fields/references' );

module.exports = ( {
  locationRes, 
  referencesRes,
  languages, 
  fileStore, 
  schemaExtensions 
} ) => {

  const eventSchema = {
    custom: eventValidators,
    fields: [ {
      "field" : "image",
      "fieldType" : "image",
      "optional" : true,
      "label" : {
        "fr" : "Image de l'événement",
        "en" : "Image of the event"
      },
      "info" : {
        "fr" : "Chargez une image d'au moins 300 pixels de large",
        "en" : "Load an image of at least 300 pixels width"
      },
      "extensions" : [ "jpg", "bmp", "png", "jpeg" ],
      "store" : fileStore
    }, {
      "field" : "imageCredits",
      "fieldType" : "text",
      "optional" : true,
      "label" : {
        fr : 'Crédits de l\'image',
        en: 'Image credits'
      },
      "enableWith" : "image"
    }, {
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
        "fr" : "",
        "en" : ""
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
      "max" : 200,
      "placeholder" : {
        "fr" : "Une courte description de votre événement",
        "en" : "A short description of your event"
      },
      "sub": {
        "fr" : "",
        "en" : ""
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
      "max" : 10000,
      "sub" : {
        "fr" : "",
        "en" : ""
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
      "max" : 255,
      "sub" : {
        "fr" : "",
        "en" : ""
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
      field: 'accessibility',
      fieldType: 'accessibility',
      optional: true,
      label: {
        fr: 'Accessibilité',
        en: 'Accessibility'
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
        insee: '#locations/insee',
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

  if ( !_.isArray( schemaExtensions ) ) return eventSchema;

  if ( _hasReferencesField( schemaExtensions ) ) {

    eventSchema.fields.push( eventReferencesField( { res: referencesRes } ) );

  }

  return merge.apply( null, [ eventSchema ].concat( schemaExtensions ) );

}

function _hasReferencesField( schemaExtensions ) {

  return !!_.flatten( schemaExtensions.map( s => s.fields ) )
    .filter( f => f.field === 'references' ).length;

}

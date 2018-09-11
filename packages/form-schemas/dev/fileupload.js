"use strict";

module.exports = {
  fileKey: 'uniquefilekey123',
  values: {
    somefile: { 
      originalName: 'alorsalors.jpg',
      extension: 'jpg',
      filename: 'uniquefilekey123.somefile.jpg'
    }
  },
  schema: {
    fields : [ {
      "field" : "somefile",
      "fieldType" : "file",
      "extensions" : [ 'jpg', 'pdf' ],
      "store" : {
        "type" : "s3",
        "bucket" : "oadev"
      },
      "label" : {
        "fr" : "C'est un champ qui permet de charger un fichier"
      },
      "info" : {
        "fr" : "Le texte info"
      },
      "sub" : {
        "fr" : "Le texte dessous"
      }
    }, {
      field: 'someotherfield',
      fieldType: 'text',
      label: {
        fr: 'Libre',
        en: 'Free'
      }
    } ]
  }
}

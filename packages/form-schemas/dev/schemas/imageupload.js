"use strict";

module.exports = {
  fileKey: 'uniquefilekey',
  values: {
    someimage: {
      originalName: 'large_monkey-shoulder-thumb.jpg',
      extension: 'jpg',
      filename: 'uniquefilekey.someimage.jpg'
    }
  },
  schema: {
    fields : [ {
      "field" : "someimage",
      "fieldType" : "image",
      "extensions" : [ 'jpg', 'bmp', 'png' ],
      "store" : {
        "type" : "s3",
        "bucket" : "oadev"
      },
      "label" : {
        "fr" : "C'est un champ qui permet de charger une image"
      },
      "info" : {
        "fr" : "Le texte info"
      },
      "sub" : {
        "fr" : "Le texte dessous"
      }
    }, {
      "field" : "somerequiredimage",
      "fieldType" : "image",
      "extensions" : [ 'jpg' ],
      "optional" : false,
      "label" : "A required image"
    } ]
  }
}

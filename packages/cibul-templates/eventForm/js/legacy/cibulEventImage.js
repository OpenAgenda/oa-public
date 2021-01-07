"use strict";

var utils = require( '@openagenda/utils' ),

rUtils = require( '../reactUtils' ),

du = require( '../../../js/lib/domUtils' ),

handleEventImage = require( './handleEventImage' ),

formConfiguration = require( '../formConfiguration' );

module.exports = function( params ) {

  params = utils.extend({
    language: 'en',
    configuration: false,
    canvas: '.js_event_image_canvas',
    upload: false, // required. resource to upload image
    remove: false, // required. resource to remove image
    events: {
      fetch: 'eimagefetch',
      send: 'eimagesend',
      creditsSend: 'ecreditssend',
      remove: 'eimageremove',
      heightChange: 'heightchange'
    },
    imagePrefix: 'evf',
    labels: {},
    path: false // path where uploaded images are accessible
  }, params);

  var eh = rUtils.eh,

  run = function() {

    var imageConfiguration = formConfiguration( params.configuration ? params.configuration : {}, { lang: params.language } ).field( 'image' );

    if ( imageConfiguration.info ) {

      params.labels.info = imageConfiguration.info[ params.language ];

    }

    if ( imageConfiguration.title ) {

      params.labels.imageSection = imageConfiguration.title[ params.language ];

    }

    eh.trigger( params.events.fetch, data => {

      handleEventImage( {
        labels: params.labels,
        canvas: params.canvas,
        upload: params.upload,
        remove: params.remove,
        onSuccess: function( name ) {

          eh.trigger( params.events.send, { image: name } );

        },
        onRemove: function() {

          eh.trigger( params.events.remove );

          eh.trigger( params.events.heightChange );

        },
        onImageLoad: function() {

          eh.trigger( params.events.heightChange );

        },
        onCreditsUpdate: function( credits ) {

          eh.trigger( params.events.creditsSend, credits );

        },
        initName: data.image?data.image:false,
        initCredits: data.credits,
        path: params.path,
        prefix: params.imagePrefix
      });

    });

  };

  run();

};

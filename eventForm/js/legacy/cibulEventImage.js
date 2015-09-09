"use strict";

var utils = require( 'utils' ),

rUtils = require( '../reactUtils' ),

du = require( '../../../js/lib/domUtils' ),

EJS = require( '../../../js/lib/clientEjs/ejs' ),

handleEventImage = require( './handleEventImage' );

module.exports = function( params ) {

  params = utils.extend({
    canvas: '.js_form_canvas_above',
    upload: false, // required. resource to upload image
    remove: false, // required. resource to remove image
    events: {
      fetch: 'eimagefetch',
      send: 'eimagesend',
      remove: 'eimageremove',
      heightChange: 'heightchange'
    },
    imagePrefix: 'evf',
    labels: {},
    path: false // path where uploaded images are accessible
  }, params);

  var eh = rUtils.eh,

  run = function() {

    eh.trigger(params.events.fetch, function(data) {

      handleEventImage({
        labels: params.labels,
        canvas: params.canvas,
        upload: params.upload,
        remove: params.remove,
        onSuccess: function(name) {

          eh.trigger(params.events.send, {image: name});

        },
        onRemove: function() {

          eh.trigger(params.events.remove);

          eh.trigger(params.events.heightChange);

        },
        onImageLoad: function() {
          eh.trigger(params.events.heightChange);
        },
        initName: data.image?data.image:false,
        path: params.path,
        prefix: params.imagePrefix
      });

    });

  };

  run();

};
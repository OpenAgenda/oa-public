var cibulEventImage = function(params) {

  params = extend({
    canvas: false,
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

  var eh = sEventHandler.getInstance(),

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
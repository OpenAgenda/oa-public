var sendGetMessage = function(options) {

  options = extend({
    debug: false,
    timeout: '<i class="icon-frown"></i>',
    lightboxClasses: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons', button: 'small button'}
  }, options);

  var spinner
  ,

  run = function() {

    _think();

    remote.get(options.url, { data: options.data, retries: 0, timeout: 10000 }, function(responseType, data) {

      _unthink();

      if (responseType == 'timeout') lightbox({
        message: options.timeout,
        classes: options.lightboxClasses
      });

      if (responseType == 'success' && data.message) lightbox({
        message: data.message,
        classes: options.lightboxClasses
      });

      if (options.complete) options.complete();

      if (responseType == 'success' && options.success) options.success(data);

    }, !options.debug);

  },
  _think = function() {

    if (!spinner) spinner = new Spinner({lines: 7, // The number of lines to draw
      length: 3, // The length of each line
      width: 2, // The line thickness
      radius: 3, // The radius of the inner circle
      corners: 0, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 22, // Afterglow percentage
      className: 'button-spinner', // The CSS class to assign to the spinner
    });

    spinner.spin();

    options.button.insertAdjacentElement('afterend', spinner.el);

  },
  _unthink = function() {

    spinner.stop();

  }

  ; run();

};
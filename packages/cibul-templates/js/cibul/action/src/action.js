if (typeof action == 'undefined') var action = function(elem, params) {

  params = extend({
    message: false, // if set, displays lighbox with message
    link: false, // if set, depending on type, launches a request
    confirm: false, // if true, displays lightbox with message before sending request
    type: 'html', // type of request if request is to be sent
    onClick: false, // callback on action click
    labels: { ok: 'Ok', cancel: 'Cancel'}
  }, params);

  addEvent(elem, 'click', function(e) {

    preventDefault(e);

    if (params.confirm) {

      lightbox({
        message: params.message,
        classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons'},
        buttons: {
          cancel: { label: params.labels.cancel },
          ok: { label: params.labels.ok, onClick: function() { window.location.href = params.link; }},
        }
      });

    } else if (params.message) {

      lightbox({
        message: params.message,
        classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons'}
      });

    } else if (contains(['ajax', 'jsonp'], params.type)) {

      var reqParams = { retries: 1, timeout: 10000 };

      if (params.type=='jsonp') reqParams.data = {format: 'jsonp'};

      remote.get(params.link?params.link:elem.getAttribute('href'), reqParams, function(responseType, data) {

        if (responseType=='success') {

          var lParams = {
            classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons'}
          };

          if (data.redirect) {
            window.location.href = data.redirect;
            return;
          }

          if (data.message) lParams.message = data.message;
          

          if (data.partial) extend(lParams, {
            html: data.partial,
            buttons: false
          });

          lightbox(lParams);
          
        }

      }, params.type=='ajax'?true:false);

    } else if (params.link) {

      window.location.href = params.link;

    }

    if (params.onClick) params.onClick();

  });

};
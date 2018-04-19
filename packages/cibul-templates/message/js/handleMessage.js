if (typeof handleMessage == 'undefined') (function() {
  
  var handleMessage = function(params) {

    params = extend({
      elems: {
        messages: els('.js_message_content')
      },
      classes: {
        links: 'url'
      }
    }, params);

    setLinksElems(params.elems.messages, {className: params.classes.links });

  };

  window.handleMessage = handleMessage;

})();
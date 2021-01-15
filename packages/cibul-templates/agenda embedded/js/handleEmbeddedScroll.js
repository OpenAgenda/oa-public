var handleEmbeddedScroll = function(params) {

  var scroll,
  eh = sEventHandler.getInstance(),

  params = extend({
    elems: { canvas: false },
    events: {
      heightChange: 'embedheightchange',
      openEvent: 'openevent',
      closeEvent: 'closeevent',
    },
    wrapperId: 'wrapper'
  }, params),

  init = function() {

    if (!params.elems.canvas.id.length) params.elems.canvas.id = params.wrapperId;

    document.getElementsByTagName('html')[0].style.height = 
    params.elems.canvas.style.height = '100%';

    params.elems.canvas.style.cursor = 'move';
    params.elems.canvas.style.marginRight = '10px';


    scroll = new iScroll(params.wrapperId);

    eh.on(params.events.heightChange, function() {

      scroll.refresh();

    });

    eh.on(params.events.openEvent, function(){

      scroll.scrollTo(0,0);

    });

  };

  init();

};
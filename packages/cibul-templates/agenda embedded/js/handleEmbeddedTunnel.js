var handleEmbeddedTunnel = function(params){

  params = extend({
    events: {
      initList: 'initlist',
      hasNextPage: 'hasNext',
      nextPageRequest: 'loadNext',
      loadSuccess: 'success',
      heightChange: 'embedheightchange',
      openEventSuccess: 'eventopensuccess',
      load: 'load',
      openEvent: 'openevent',
      closeEvent: 'closeevent',
      onDateLocationSelection: 'eventdateplaceselect',
      onDateLocationSelectionCancel: 'eventmapplaceunselect'
    }
  }, params);

  var tunnel,
      height,

  eh = sEventHandler.getInstance(),

  init = function() {

    tunnel = iTunnel({ onReady: function() {

      _handleTunnelSends();

      eh.trigger(params.events.initList);

    }, onReceive: _handleTunnelReceive });

  },


  _handleTunnelSends = function() {

    eh.on(params.events.hasNextPage, function(hasNext) {

      tunnel.send({hasNext: hasNext, event: params.events.hasNextPage });

    });

    // this is executed every time data is successfully loaded by the list handler
    
    eh.on(params.events.loadSuccess, function(data){

      // know the height
      delete data.data;

      height = _getHeight();

      var sentData = extend(data, { height: height, event: params.events.loadSuccess });

      tunnel.send(sentData);

    });

    eh.on(params.events.heightChange, function() {

      var newHeight = _getHeight();

      if (height == newHeight) return;
      
      height = newHeight;

      tunnel.send({ height: height });

    });

    eh.on(params.events.openEventSuccess, function(data) {

      tunnel.send({ eventDisplay: true, event: params.events.openEventSuccess, uid: data.uid });

    });

    eh.on(params.events.closeEvent, function() {

      tunnel.send({ eventDisplay: false, event: params.events.closeEvent, uid: null });

    });

    eh.on(params.events.onDateLocationSelection, function(data) {

      tunnel.send({ location: data, event: params.events.onDateLocationSelection });

    });

    eh.on(params.events.onDateLocationSelectionCancel, function(data) {

      tunnel.send({ location: data, event: params.events.onDateLocationSelectionCancel });

    });

    eh.trigger(params.events.heightChange);

    tunnel.send({ event: params.events.loadSuccess });

  },

  _getHeight = function() {
    // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
    return document.getElementsByTagName('body')[0].offsetHeight;
  },

  _handleTunnelReceive =  function(data) {

    for ( var key in data ) {

      if ( data[key]=='null' ) data[key] = null;

    }

    if ( data.event ) {

      if ( data.event == params.events.nextPageRequest ) {
        
        eh.trigger(params.events.nextPageRequest);

      } else if ( data.event == params.events.load ) {

        eh.trigger( params.events.load, data );

      }

    }

  };

  init();

};
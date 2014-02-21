if (typeof cibulAgendaControllers == 'undefined') (function() {

  var controllers = {},


  /**
   * an agenda controller handles the logic of defining active / inactive data for a specific agenda.
   * it registers all widget present on page for that agenda and relays them the current state as it changes
   * allowing them to display up to date information
   * 
   * @param  string    uid      pair of the embed / agenda
   * @param  string    key      the public key of the user owning the embed
   * 
   * @return object    public   methods of the controller
   */
  
  controller = function(uid) {

    var aParams = {}, // current agenda parameters. updated by data link

    widgets = [], // the widgets that registered to this controller

    key = false,

    ready = false, // controller readiness to do anything

    ctl = false, // control data here

    sendRequest = false, // method given by link to 

    ctlRequests = [], // control data requests stack


    /**
     * register a widget - run by widget to establish link with controller
     * 
     * @param   object      params  whatever this could be
     * @return  function    the callback to be used by the widget when it changes values
     */
    
    register = function(params) {

      // if there is a key, this is a link
      if (params.key) return _registerLink(params);

      widgets.push(params);

      return {
        update: update,
        getControlData: getControlData
      };
      
    },


    /**
     * called by widget when some values were updated
     * 
     * @param  object    value   the values updated by the widget
     */
    
    update = function(value) {

      // on update the controller appends it to the agenda params, and checks if there is a change

      var newParams = extend({}, aParams, value);

      if (!_hasChanges(newParams)) return;

      _forEachWidget('disable');

      if (!sendRequest) return console.log('controller has no link to send request to');

      sendRequest(newParams);

    },


    /**
     * hand over control data. stack request if data is not ready
     */
    
    getControlData = function(callback) {

      if (ctl) return callback(ctl);

      ctlRequests.push(callback);

    },


    /**
     * get agenda control data
     */
    
    _fetchControllerData = function(callback) {

      // what to do if it is not successful?
      
      var res = (isDef(cibulDebug)?cibulDebug.paths.ctl:'//cibul.net/embed/{uid}/controldata').replace('{uid}', uid);
      
      remote.getJsonp(res, {data: {key: key}}, function(success, data) {

        if (!success) return console.log('control data could not be fetched for ' + uid);

        callback(data.data);

      });

    },


    /**
     * register a data link.
     * a link for the controller serves as the reference for data exchanges.
     * it indicates when requests have been processed by server
     */
    
    _registerLink = function(params) {

      ready = false;

      key = params.key;

      // register link method as method to call when there is a change in params
      sendRequest = params.sendRequest;

      _fetchControllerData(function(data) {

        ready = true;

        ctl = data;

        var stackedCallback;

        // send control data to whoever requested it during registration process
        while (stackedCallback = ctlRequests.pop()) {

          stackedCallback(ctl);

        }

        _sweep();

      });

      return {
        onResponse: _linkReady // link calls this whenever it has an update
      };

    },


    /**
     * called by link when changes have been received
     */
    
    _linkReady = function(data) {

      if (!_hasChanges(data)) return;

      aParams = data;

      if (ready) _sweep(aParams);

    },


    /**
     * sweep through agenda control data to figure out which events are still within selection
     * and which are not
     */
    
    _sweep = function(reqParams) {

      if (typeof reqParams == 'undefined') reqParams = {};

      _forEachWidget('clear');

      for (var i in ctl.a)
        if (_applyFilters(ctl.a[i], reqParams)) _include(ctl.a[i]);

      _forEachWidget('enable', reqParams);

    },


    /**
     * as part of sweep, tell widgets event item passed through filters
     */
    
    _include = function(item) {

      for (var i = widgets.length - 1; i >= 0; i--) {

        widgets[i].include(item);

      }

    },


    /**
     * run item through all widget filters.. this will not work as not all widgets are always used.
     * but filtering by location is not possible if there are no location widgets
     */
    
    _applyFilters = function(item, reqParams) {

      for (var i in filters) {

        if (!filters[i](item, reqParams)) return false;

      }

      return true;

    },

    _forEachWidget = function(methodName, methodParams) {

      for (var i = widgets.length - 1; i >= 0; i--) {
        widgets[i][methodName](methodParams);
      }

    },


    /**
     * has there been any changes in parameters?
     */
    
    _hasChanges = function(data) {

      for (var i in aParams) if (!isDef(data[i]) || data[i] !== aParams[i] ) return true;

      for (i in data) if (!isDef(aParams[i]) || data[i] !== aParams[i] ) return true;

      return false;

    };

    return {
      register: register
    };

  },


  /**
   * registers widget to an agenda controller for specific uid/key
   * 
   * @param  {[type]} name   [description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  
  register = function(name, params) {

    if (!params.uid) return console.log(name + ': could not register widget : uid not set');

    if (!isDef(controllers[params.uid])) controllers[params.uid] = controller(params.uid);

    return controllers[params.uid].register(params);

  },

  /**
   * filters used during sweep
   */

  filters = {
    
    categories: function(item, reqParams) {

      if (reqParams.category && (item.c !== reqParams.category)) return false;

      return true;

    },

    tags: function(item, reqParams) {

      if (reqParams.tag) {

        if (item.t) for (var i = item.t.length - 1; i >= 0; i--) {

          if (reqParams.tag == item.t[i]) return true;

        }

        return false;

      }

      return true;

    },

    locations: function(item, reqParams) {

      if (reqParams.location && (typeof item.l[reqParams.location] == 'undefined')) return false;

      // is one of the locations within square... works most places
      
      if (reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng) {

        for (var i in item.l) {

          var coords = [item.l[i].lt, item.l[i].lg];

          if ((reqParams.neLat > coords[0]) &&

          (reqParams.neLng > coords[1]) &&

          (reqParams.swLat < coords[0]) &&

          (reqParams.swLng < coords[1])) return true;

        }

        return false;

      }

      return true;

    },

  };

  window.cibulAgendaControllers = {
    register: register
  };

})();
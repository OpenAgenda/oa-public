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

    ctlRequests = [], // control data requests stack


    /**
     * register a widget
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

      console.log('controller: update received from widget. Value is:');

      console.log(value);

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

      _fetchControllerData(function(data) {

        ready = true;

        ctl = data;

        var stackedCallback;

        while (stackedCallback = ctlRequests.pop()) {

          stackedCallback(ctl);

        }

        _sweep();

      });

      return _linkReady;

    },


    /**
     * called by link when changes have been received
     */
    
    _linkReady = function(data) {

      if (!_hasChanges(data)) return;

      aParams = data;

      if (ready) _sweep();

    },


    /**
     * sweep through agenda control data to figure out which events are still within selection
     * and which are not
     */
    
    _sweep = function() {

      _signalSweepStart();

      for (var i in ctl.a) {

        if (_applyFilters(ctl.a[i])) _include(ctl.a[i]);

      }

      _signalSweepComplete();

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
    
    _applyFilters = function(item) {

      for (var i in filters) {

        if (!filters[i](item)) return false;

      }

      return true;

    },


    /**
     * clear widgets
     */
    
    _signalSweepStart = function() {

      for (var i = widgets.length - 1; i >= 0; i--) {
        widgets[i].clear();
      }

    },


    /**
     * once sweep is complete, enable widgets
     */
    
    _signalSweepComplete = function() {

      for (var i = widgets.length - 1; i >= 0; i--) {
        widgets[i].enable();
      }

    },


    /**
     * has there been any changes in parameters?
     */
    
    _hasChanges = function(data) {

      var changes = false;

      for (var i in aParams) if (!isDef(data[i]) || data[i] !== aParams[i] ) return false;

      for (i in data) if (!isDef(aParams[i]) || data[i] !== aParams[i] ) return false;

      return true;

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

      return item;

    }

  };

  window.cibulAgendaControllers = {
    register: register
  };

})();
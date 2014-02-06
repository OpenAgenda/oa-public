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

    key = false,

    ready = false, // controller readiness to do anything

    ctl = false, // control data here


    /**
     * register a widget
     * 
     * @param   object      params  whatever this could be
     * @return  function    the callback to be used by the widget when it changes values
     */
    
    register = function(params) {

      // if there is a key, this is a link
      if (params.key) return _registerLink(params);

      // do the registering of the widget

      return _update;
      
    },


    /**
     * called by widget when some values were updated
     * 
     * @param  object    value   the values updated by the widget
     */
    
    _update = function(value) {

      console.log('controller: update received');

      console.log(value);

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
     * 
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    
    _registerLink = function(params) {

      ready = false;

      key = params.key;

      _fetchControllerData(function(data) {

        ready = true;

        ctl = data;

      });

      return _linkReady;

    },


    /**
     * called by link when changes have been received
     */
    
    _linkReady = function(data) {

      if (!_hasChanges(data)) return;

      aParams = data;

      //_sweep();

    },

    /**
     * has there been any changes in parameters?
     */
    
    _hasChanges = function(data) {

      var changes = false;

      for (var i in aParams) if (!isDef(data[i]) || data[i] !== aParams[i] ) return false;


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

  };

  window.cibulAgendaControllers = {
    register: register
  };

})();
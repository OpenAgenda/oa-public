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
  
  controller = function(uid, key) {

    var aParams = {}, // current agenda parameters

    res = (isDef(cibulDebug)?cibulDebug.paths.ctl:'//cibul.net/embed/{uid}/controldata?key={key}').replace('{uid}', uid).replace('{key}', key),

    ready = false, // controller is ready only when link is established and agenda controller data is in hand

    run = function() {

      _fetchControllerData(function(data) {

        // control data is here
        console.log(data);

        console.log('get link registered and loaded. should be the list iframe');

      });

    },


    /**
     * register a widget
     * 
     * @param   object      params  whatever this could be
     * @return  function    the callback to be used by the widget when it changes values
     */
    
    register = function(params) {

      if (params.type == 'link') return _linkReady;

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
      
      remote.getJsonp(res, {}, function(success, data) {

        if (!success) return console.log('control data could not be fetched for ' + uid);

        callback(data.data);

      });

    },


    /**
     * called by link when there are changes
     */
    
    _linkReady = function() {

      console.log('aaand the link is ready, sweep on data can be done');

    };

    run();

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
    if (!params.key) return console.log(name + ': could not register: key not set');

    if (!isDef(controllers[params.uid])) controllers[params.uid] = controller(params.uid, params.key);

    return controllers[params.uid].register(name, params);

  };

  window.cibulAgendaControllers = {
    register: register
  };

})();
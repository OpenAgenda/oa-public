/* EventHandler v0.2 */
(function( root ){

  var EventHandler = function(){
    this.register = {};
    this.nextId = 1;
  };

  EventHandler.prototype = {

    // register new function to call on event, returns an track id of the function
    on: function(eventName, func){

      if (typeof this.register[eventName] == 'undefined') this.register[eventName] = [];

      this.register[eventName].push({func: func, funcId: this.nextId});

      return this.nextId++;

    },

    trigger: function(eventName, params){

      if (typeof this.register[eventName] == 'undefined') this.register[eventName] = [];

      var i = this.register[eventName].length;

      while (i--)
        this.register[eventName][i].func(params);

    },

    cancel: function(funcId){

      var i;

      for (var eventName in this.register) {

        i = this.register[eventName].length;

        while (i--)
          if (funcId==this.register[eventName][i].funcId) {

            this.register[eventName].splice(i,1);

            return true;

          }

      
      }

      return false;

    },

    clear: function() {

      this.register = {};

    },

    hasEvent: function(name) {

      return typeof this.register[name] != 'undefined';

    }

  };

  root.EventHandler = EventHandler;

  root.sEventHandler = (function() {

    var instance;

    return {
      getInstance: function() {

        if (!instance)
          instance = new EventHandler();

        return instance;
      }
    };

  })();

})( typeof exports !== 'undefined' ? exports : window );
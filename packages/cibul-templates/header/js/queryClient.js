/**
 * queryClient takes a link and holds parameters setters and getters to be used to fetch data from a server
 * 
 * queryClient.setParameter
 *             .getParameter
 *             .getData
 *             .loadData
 *             .isLoading
 *             .initLinkAndParameters - reinintialize internal link and parameters from page link and anchor (if any)
 */

var queryClient = function(link, options){

  this.init = function(link, options){

    this.jQuery = false;

    if (typeof options != 'undefined') if (typeof options.jQuery != 'undefined') this.jQuery = options.jQuery;

    if (!this.jQuery) this.jQuery = $;

    this.options = this.jQuery.extend({}, this.jQuery.extend(this.jQuery.extend({}, this.defaults), options));

    this.anchor = false;
    this.synced = false;
    this.loading = false;

    this.loadingDoneCallbackStack = [];

    if (this.options.anchor) this.anchor = new anchorSet(this.options.anchor);

    this.initLinkAndParameters(link);

    this.searchData = {};

    if (this.options.autoSync) this.getData();

  };

  this.defaults = {
    anchor: false,              // name of the anchor set to use for storing parameters
    autoAnchor: false,          // update anchor values systematically when data is loaded
    autoSync: false,            // launch a query as soon as parameter is changed
    onResponse: false,          // callback method run on reception of data
    testData: false,            // if testData is to be fetched
    parameters: {},             // parameters to initialize searchClient with
    syncedCallback: false,   // callback called when the search client goes out of sync (because of an updated param)
    unSyncedCallback: false, // callback called when the search client goes back in sync
    jsonp: false
  };

  this.setParameter = function(name, value, callback){

    var changeValue = false;

    if (typeof this.parameters[name] == 'undefined') {

      changeValue = true;
    
    }
    else if (this.parameters[name] != value) {

      changeValue = true;
    
    }

    if (changeValue) {

      this.parameters[name] = value;

      this.setUnSynced();

      if (this.options.autoSync) this.getData(callback);

    }

  };

  this.setParameters = function(nameValuePairs, callback){
    
    var changeValue = false;

    for (name in nameValuePairs) {

      if (!changeValue) {
        
        if (typeof this.parameters[name] == 'undefined') {
        
          changeValue = true;
        
        }
        else if (this.parameters[name] != nameValuePairs[name]) {

          changeValue = true;
        
        }
      }

      this.parameters[name] = nameValuePairs[name];
    }

    if (changeValue) {

      this.setUnSynced();

      if (this.options.autoSync) this.getData(callback);

    }

  };

  this.getParameter = function(name, defaultValue){

    if (typeof this.parameters[name] == 'undefined') return defaultValue;

    return this.parameters[name];
  
  };

  this.getParameters = function(){
    
    return this.parameters;

  };

  this.getData = function(callback){

    if (this.synced) {

      if (this.options.onResponse) this.options.onResponse(this.searchData);

      if (typeof callback != 'undefined') callback(this.searchData);

    } else {
      
      this.loadData(callback);

    }
  };

  this.loadData = function(callback){

    if (this.loading) return false; // can't load data if is already querying

    this.loading = true;

    if (this.anchor && this.options.autoAnchor) this.anchor.setAll(this.parameters);

    if (this.options.loadingOn) this.options.loadingOn();

    if (this.options.testData !== false) {

      //console.log('searchClient - loadData with parameters at ' + $.param(this.parameters));

      // test mode
      
      setTimeout(this.jQuery.proxy(function(){

        if (this.options.loadingOff) this.options.loadingOff();

        this.loading = false;
        this.searchData = this.options.testData;
        
        this.setSynced();

        if (typeof callback != 'undefined') callback(this.searchData);

        if (this.options.onResponse) this.options.onResponse(this.searchData);

      }, this), 3000);

    } else {

      this.jQuery.ajax({
        type: 'get',
        url: this.link,
        data: this.parameters,
        timeout: 20000,
        dataType: this.options.jsonp?"jsonp":"json",
        complete: function(XmlHttpRequest, textStatus){
          
          if (textStatus=='timeout') {
            this.loading = false;
            if (this.options.loadingOff) this.options.loadingOff();
            
          }

        },
        success: this.jQuery.proxy(function(data, textStatus){

          if (this.options.loadingOff) this.options.loadingOff();
          
          this.loading = false;
          this.searchData = data;
          
          this.setSynced();

          if (typeof callback != 'undefined') callback(data);

          if (this.options.onResponse) this.options.onResponse(data);

          if (this.loadingDoneCallbackStack.length) { // loading done callback is executed once only

            var poppedCallback = this.loadingDoneCallbackStack.pop();

            poppedCallback();
          }

        }, this)

      });

    }
    

  };

  this.setOnExternalChange = function(callback){
    if (this.anchor) this.anchor.setOnChange(callback);
  };

  this.isLoading = function(){

    return this.loading;

  };

  this.addLoadingDoneCallback = function(callback) {
    
    this.loadingDoneCallbackStack.unshift(callback);

  };

  this.isSynced = function(){
    
    return this.synced;

  };

  this.setOnResponse = function(callback){

    this.options.onResponse = callback;
    
  };

  this.resetParameters = function(){
    
    this.parameters = {};

  };

  // initialize client link and parameters from constructor link, parameters in options and anchor (if set)
  this.initLinkAndParameters = function(link){

    if (typeof link != 'undefined') {
      
      this.link = link.replace(/\?.+/, '');

      link = link.replace(/\+/g,'%20'); // this bit replaces + with %20

      var linkParams = decodeURIComponent(link).getUrlParameters();

      this.parameters = this.jQuery.extend(this.options.parameters, linkParams);

    } else {
      
      this.parameters = this.options.parameters;

    }

    if (this.anchor) {

      //console.log('searchClient - initLinkAndParameters - loading up parameters with anchor');

      this.parameters = this.jQuery.extend(this.parameters, this.anchor.getAll());

      if(this.options.autoAnchor) this.anchor.setAll(this.parameters);
    }

  };

  this.loadAnchor = function(callback){
    
    if (this.anchor) {
      
      this.anchor.setAll(this.parameters);

      if (typeof callback != 'undefined') callback();

    }

  };

  this.setUnSynced = function(){
    
    if (!this.synced) return;

    this.synced = false;

    if (this.options.unSyncedCallback) this.options.unSyncedCallback();

  };

  this.setSynced = function(){
    
    if (this.synced) return;

    this.synced = true;

    if (this.options.syncedCallback) this.options.syncedCallback();

  };

  this.setUnsyncedCallback = function(callback){
    this.options.unSyncedCallback = callback;
  };

  this.setSyncedCallback = function(callback){
    this.options.syncedCallback = callback;
  };

  this.init(link, options);
};
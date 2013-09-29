var handleHeaderSearch = function(params) {

  params = extend({
    resEvent: false,
    resLocation: false,
    env: false,
    defaultCoord: {lat: 47.212106, lng: 2.537842, radius: 370000, where: 'France'},
    eventResource: 'http://cibul.net/ajax/event',
    markerIcon: '/images/squareMarker.png',
    templates: {
      item: '<li class="event-in-stream"><div class="event-item">' +
              '<a href="{url}" class="js_event_link"><img class="event-pic-small event-link" alt="{title}" src="{image}"></a>' +
              '<div class="event-content js_event_content">' +
                '<div class="event-name"><a class="js_event_link" href="{url}">{title}</a></div>' +
                '<div class="event-description"><a class="js_event_link" href="{url}">{description}</a></div>' +
                '<div class="whenwhere">{spacetime}</div>' +
              '</div></div></li>'
      }
  }, params);

  var eh = sEventHandler.getInstance(),

  controllers = {},

  sClient,

  locationHandler,

  init = function() {

    _setEnvSpecifics();

    // load search client

    sClient = new queryClient(params.resLocation, {
      anchor: 'sClient', 
      autoAnchor: true,
      jsonp: params.jsonp,
      loadingOn: function(){ $('.js_map').lock(true, {dim: true, gif_path: (params.env=='template'?'':'/')+'images/ajax-loader.gif'}); },
      loadingOff: function(){ $('.js_map').lock(false); }
    });

    if (typeof sClient.getParameter('lat') == 'undefined') sClient.setParameters({lat: params.defaultCoord.lat, lng: params.defaultCoord.lng, where: params.defaultCoord.where, radius: params.defaultCoord.radius });

    // load search field controllers

    // sClient should throw all search values at init,
    // controllers should just throw 

    initWhatController({
      initData: sClient.getParameter('what', ''),
      onChange: function(newTags){
        sClient.setParameter('what', newTags);
      }
    });

    initWhenController({
      locale: params.env=='template'?'fr':$.getSessionCookie().culture,
      initData: sClient.getParameter('when', ''),
      onChange: function(newDates) {
        sClient.setParameter('when', newDates);
      }
    });

    controllers.where = initWhereController({
      initData: {
        latitude: sClient.getParameter('lat', ''),
        longitude: sClient.getParameter('lng', ''),
        radius: sClient.getParameter('radius', ''),
        where: sClient.getParameter('where', ''),
        env: params.env
      },
      onChange: function(){}
    });

    _handleListViewClick('.js_list_view', '.js_list_view_link');

  },
  
  /**
   * init map search tools and where input controller
   */
  _initMapAndSearch = function(){

    var gMap = _createMap()
      , gCircle = _createCircle();

    _mapDragControl(gCircle);

    _initWhereControllerOnChange(function(newPos){ // onChange

      sClient.setParameters({where: newPos.where, lat: newPos.latitude, lng: newPos.longitude, radius: parseInt(newPos.radius, 10)});
      
      gCircle.updatePositionRadius({latitude: newPos.latitude, longitude: newPos.longitude, radius: parseInt(newPos.radius, 10)});

    });

    locationHandler = _initLocationHandling(gMap);

    _initRemoteDataFetching();

    $('.js_map').click(function(){ $('.in-field').blur() });

  },

  _initRemoteDataFetching = function(){

    // get data when search client is unsynced
    sClient.setUnsyncedCallback(function(){

      sClient.getData();
      
    });

    
    // handle received data
    sClient.setOnResponse(function(data){

      if (data.success) locationHandler.load(data['data']);

    });

    sClient.getData();

  },

  _initLocationHandling = function(gMap){

    var listController = initLocationEventsController({markerIcon: params.markerIcon, map: gMap });

    return lHandler = new LocationHandler({
      jsonp: params.jsonp,
      resEvent: params.resEvent,
      env: params.env,
      gMap: gMap,
      language: params.env=='template'?'fr':$.getSessionCookie().culture,
      markerIcon: params.markerIcon,
      listController: listController,
      templates: params.templates
    });

  },

  _createMap = function(){

    var mapDom = '.js_map';

    $(mapDom).gMap({
      markerOptions: {icon: params.markerIcon},
      mapTypeControl: false,
      scrollwheel: false,
      //zoomControl: false,
      panControl: false,
      draggable: false,
      center: new google.maps.LatLng(sClient.getParameter('lat', 0), sClient.getParameter('lng', 0))
    });

    var dragFlag = false;
    var start = 0, end = 0;

    function thisTouchStart(e) {
      setTimeout(function(){ dragFlag = true; }, 200); // so it goes after perimeter drag detection
      start = e.touches[0].pageY; 
    }

    function thisTouchEnd() {
      dragFlag = false;
    }

    function thisTouchMove(e) {
      if ( !dragFlag || markerDrag ) return;
      end = e.touches[0].pageY;
      window.scrollBy( 0,( start - end ) );
    }

    if (document.addEventListener && document.querySelector) { // ie8 doesn't have it

      document.querySelector(mapDom).addEventListener("touchstart", thisTouchStart, true);
      document.querySelector(mapDom).addEventListener("touchend", thisTouchEnd, true);
      document.querySelector(mapDom).addEventListener("touchmove", thisTouchMove, true);

    }

    return $(mapDom).data('gMap');

  },

  _createCircle = function(){

    var self = this;

    // create marker with perimeter, with callback on dragend and perimeter change
    var gCircle = new gCircledMarker({
      env: params.env,
      map: $('.js_map').data('gMap').map,
      onCenterDragEnd: function(position){
        
        sClient.setParameters({lat: position.lat(), lng: position.lng(), where: $('.js_where_input').val()});

      },
      onPerimeterChange: function(radius) {
        
        sClient.setParameter('radius', radius);

      },
      perimeterRadius: sClient.getParameter('radius', 5000)
    });

    if (window.addEventListener) window.addEventListener((('onorientationchange' in window) ? 'orientationchange':'resize'), function() {
    
      setTimeout(function(){ gCircle.toCenter(); }, 100);

    }, false);

    return gCircle;

  },

  _mapDragControl = function(gCircle){

    var markerDrag = false;

    gCircle.onDragStart = function(){ markerDrag = true; };
    gCircle.onDragEnd = function(){ markerDrag = false; };

    var dragFlag = false;
    var start = 0, end = 0;

    function thisTouchStart(e) {
      setTimeout(function(){ dragFlag = true; }, 200); // so it goes after perimeter drag detection
      start = e.touches[0].pageY; 
    }

    function thisTouchEnd() {
      dragFlag = false;
    }

    function thisTouchMove(e) {
      if ( !dragFlag || markerDrag ) return;
      end = e.touches[0].pageY;
      window.scrollBy( 0,( start - end ) );
    }

    if (document.addEventListener && document.querySelector) { // ie8 doesn't have it

      document.querySelector('.js_map').addEventListener("touchstart", thisTouchStart, true);
      document.querySelector('.js_map').addEventListener("touchend", thisTouchEnd, true);
      document.querySelector('.js_map').addEventListener("touchmove", thisTouchMove, true);

    }

  },

  _initWhereControllerOnChange = function(changeCallback) {

    controllers.where.onChange = changeCallback;

  },

  _handleListViewClick = function(targetDom, linkDom) {
    
    var self = this;

    $(targetDom).click(function(e){

      e.preventDefault();
          
      window.location.href =  $(linkDom).attr('href') + '?' + $.param(sClient.getParameters()) + document.location.hash;

    });

  },

  _setEnvSpecifics = function() {

    if (!params.env) console.log('headerSearch: env option not set');
    if (!params.resEvent) console.log('headerSearch: resEvent option not set');
    if (!params.resLocation) console.log('headerSearch: resLocation option not set');

    params.jsonp = (params.env=='template')?true:false;

    if (params.env == 'template') params.markerIcon = params.markerIcon.substr(1);
  };

  init();

  return {
    initMapAndSearch: _initMapAndSearch
  }

};
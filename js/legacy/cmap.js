/*
cmap contains:
  - A list of markers: they are stored by sets in an array of marker arrays. marker are index by numbers
  - A list of icons and shadows
  - A map
*/


//Include google maps library

/* if ($.browser.msie) document.write('<scr'+'ipt type="text/javascript" src="//maps.google.com/maps/api/js?sensor=false"></scr'+'ipt>'); */

/*document.write('<scr'+'ipt type="text/javascript" src="' + window.location.protocol + '//maps.google.com/maps/api/js?sensor=false"></scr'+'ipt>');*/


function cmap(options){

  if(options==undefined) options = Array();

  if(options['canvas']==undefined) options['canvas'] = 'map-canvas';

  this.markers = new Array();
  this.icons = new Array();
  this.shadows = new Array();

  this.bounds = new google.maps.LatLngBounds();

  //parameters: icon, shadow, name
  this.map = new google.maps.Map(document.getElementById(options['canvas']),{
    zoom: 12,
    center: new google.maps.LatLng(48.861779,2.352448),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false,
    mapTypeControl: false
  });

  //Add an icon to the cmap icons. Parameters are icon (path), shadow (path) and icon name
  this.addIcon = function(icon_options){
    if(icon_options['icon']==undefined) return false;
    //if(icon_options['shadow']==undefined) return false;
    if(icon_options['name']==undefined) return false;

    this.icons[icon_options['name']] = icon_options['icon'];
    if(icon_options['shadow']!=undefined) this.shadows[icon_options['name']] = icon_options['shadow'];
  };

  //Resize - 
  this.resize = function(){
    var center = this.map.getCenter();
    google.maps.event.trigger(this.map, 'resize');
    this.map.setCenter(center);
  };

  //Add a marker to the map. Put the following options: lat,lng,name,type, inbounds (default true), unique marker (default true), replace (default false)
  this.addMarker = function(marker_options){

    if(marker_options['lat']==undefined) return false;
    if(marker_options['lng']==undefined) return false;
    if(marker_options['icon']==undefined) return false;
    if(marker_options['inbounds']==undefined) marker_options['inbounds'] = true;
    if(marker_options['fitbounds']==undefined) marker_options['fitbounds'] = false;
    if(marker_options['center']==undefined) marker_options['center'] = false;
    if(marker_options['set']==undefined) marker_options['set'] = 'main';
    if(marker_options['uniquetitle']==undefined) marker_options['uniquetitle'] = true;
    if(marker_options['replace']==undefined) marker_options['replace'] = false;
    if(marker_options['temp']==undefined) marker_options['temp'] = false;
    if(marker_options['draggable']==undefined) marker_options['draggable'] = false;
    if(marker_options['zoom']==undefined) marker_options['zoom'] = 8;


    if(this.markers[marker_options['set']]==undefined) this.markers[marker_options['set']] = new Array();

    var gmarker_options = {
      map: this.map,
      position: new google.maps.LatLng(marker_options['lat'],marker_options['lng']),
      minZoom: marker_options['zoom']
    };

    if(this.icons[marker_options['icon']]!=undefined){
      gmarker_options['icon'] = this.icons[marker_options['icon']];
      if(this.shadows[marker_options['icon']]!=undefined) gmarker_options['shadow'] = this.shadows[marker_options['icon']];
    }

    if(marker_options['title']!=undefined) gmarker_options['title'] = marker_options['title'];

    var duplicate = false;

    if(marker_options['uniquetitle']){
      var set_index;
      var marker_index;

    for(set_index in this.markers){
      for(marker_index in this.markers[set_index]){
        if(this.markers[set_index][marker_index].getTitle()==marker_options['title']){
          if(marker_options['replace']) this.markers[set_index][marker_index] = new google.maps.Marker(gmarker_options);
            duplicate = true;
            break;
          }
        }
        if(duplicate) break;
      }
    }

    if(!duplicate) this.markers[marker_options['set']].push(new google.maps.Marker(gmarker_options));

    //New marker custom values
    this.markers[marker_options['set']][this.markers[marker_options['set']].length-1].lat = marker_options['lat'];
    this.markers[marker_options['set']][this.markers[marker_options['set']].length-1].lng = marker_options['lng'];
    this.markers[marker_options['set']][this.markers[marker_options['set']].length-1].temp = marker_options['temp'];

    //Set draggable
    this.markers[marker_options['set']][this.markers[marker_options['set']].length-1].setDraggable(marker_options['draggable']);

    if(marker_options['click']) {
      google.maps.event.addListener(this.markers[marker_options['set']][this.markers[marker_options['set']].length-1], 'click', marker_options['click']);
    }

    if(marker_options['dragend'])
      google.maps.event.addListener(this.markers[marker_options['set']][this.markers[marker_options['set']].length-1], 'dragend', marker_options['dragend']);

    if(marker_options['inbounds']){
      zoomChangeBoundsListener = google.maps.event.addListener(this.map, 'bounds_changed', function(event) {
        if (this.getZoom() > 15) this.setZoom(15);
        google.maps.event.removeListener(zoomChangeBoundsListener);
      });

      this.bounds.extend(this.markers[marker_options['set']][this.markers[marker_options['set']].length-1].getPosition());
    }

    if (marker_options['fitbounds']) this.fitBounds();

    if(marker_options['center']) {
      this.map.setCenter(this.markers[marker_options['set']][this.markers[marker_options['set']].length-1].getPosition());      
    }

    return this.markers[marker_options['set']][this.markers[marker_options['set']].length-1];
  };

  this.fixMarkers = function(){
    var set_index;
    var marker_index;

    for(set_index in this.markers){
      for(marker_index in this.markers[set_index]){
        //if marker is draggable it needs to be recentered
        if(this.markers[set_index][marker_index].draggable){
          this.markers[set_index][marker_index].setPosition(new google.maps.LatLng(this.markers[set_index][marker_index].lat,this.markers[set_index][marker_index].lng));
          this.markers[set_index][marker_index].setDraggable(false);
        }

        //if marker is temporary, it should be removed
        var temp_marker;
        if(this.markers[set_index][marker_index].temp){
          temp_marker = this.markers[set_index].splice(marker_index,1);
          temp_marker[0].setMap(null);
          temp_marker[0] = null;
        }
      }
    }
  };

  //Highlight markers with given title, set others to default icon
  this.highlightByTitle = function(highlight_options){
    if(highlight_options['title']==undefined) return false;
    if(highlight_options['icon']==undefined) return false;
    if(this.icons[highlight_options['icon']]==undefined) return false;
    if(highlight_options['others']==undefined) return false;
    if(this.icons[highlight_options['others']]==undefined) return false;

    //loop through marker sets, look at title, switch icons accordingly
    var set_index;
    var marker_index;
    for(set_index in this.markers){
      for(marker_index in this.markers[set_index]){
        if(this.markers[set_index][marker_index].getTitle()==highlight_options['title']){
          this.markers[set_index][marker_index].setIcon(this.icons[highlight_options['icon']]);
          this.markers[set_index][marker_index].setShadow(this.shadows[highlight_options['icon']]);
          this.map.panTo(this.markers[set_index][marker_index].getPosition());
        }
        else{
          this.markers[set_index][marker_index].setIcon(this.icons[highlight_options['others']]);
          this.markers[set_index][marker_index].setShadow(this.shadows[highlight_options['others']]);
        }
      }
    }
  };

  this.panTo = function(position){
    this.map.panTo(position);
  };

  this.fitBounds = function(){
    
    var center = this.bounds.getCenter();
    var unit = 0.005;

    this.bounds.extend(new google.maps.LatLng(center.lat()+unit,center.lng()+unit));
    this.bounds.extend(new google.maps.LatLng(center.lat()-unit,center.lng()-unit));
    
    this.map.fitBounds(this.bounds);
  };

  /*this.setMarkerDraggable = function(name, set_name, func){
    this.findMarker(name, set_name, function(){
      if(func!=undefined) this.func();
      this.setDraggable(true);
    })
  }
  
  this.unsetMarkerDraggable = function(name, set_name, func){
    this.findMarker(name, set_name, function(){
      this.setDraggable(false);
    })
  }*/

  this.markerHandle = function(name, set_name, func){
    
    if(set_name == undefined) set_name = 'main';

    var index = this.findMarker(name, set_name);

    if(index){
      this.markers[set_name][index].func = func;
      this.markers[set_name][index].func();
      return this.markers[set_name][index];
    }
    else return false;
  };

  this.removeMarker = function(options){
    if(options['name']==undefined) return false;
    if(options['set_name']==undefined) options['set_name'] = 'main';

    var index = this.findMarker(options['name'], options['set_name']);

    if(index){
      var temp_marker = this.markers[options['set_name']].splice(index,1);
          temp_marker[0].setMap(null);
          temp_marker[0] = null;
      return true;
    }

    return false;
  };

  //finds a marker by name and set and executes function func on it
  this.findMarker = function(name, set_name){
    var success = false;
    if(set_name == undefined) set_name = 'main';

    var marker_index;
    for(marker_index in this.markers[set_name]){
      if(this.markers[set_name][marker_index].getTitle()==name){
        success = marker_index;
        break;
      }
    }

    return success;
  };

  this.findMarkerByIndex = function(index, set_name) {
    var success = false;

    if (set_name == undefined) set_name = 'main';

    return this.markers[set_name][index];
  };
  
}
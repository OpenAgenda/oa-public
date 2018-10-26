"use strict";

var React = require( 'react' ),

PropTypes = require( 'prop-types' ),

createReactClass = require( 'create-react-class' ),

L = require( 'leaflet' ),

defaults = {
  tiles: '//{s}.tiles.mapbox.com/v3/foursquare.meku766r/{z}/{x}/{y}.png',
  markerIcon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png',
  pos: [ 40, 0 ],
  iconAnchor: [ 9, 25 ], 
  zoom: 2,
  focusedZoom: 13
};

module.exports = createReactClass( {

  propTypes: {
    enabled: PropTypes.bool,
    resetZoom: PropTypes.bool,
    location: PropTypes.object.isRequired,
    draggableMarker: PropTypes.bool,
    scrollable: PropTypes.bool,
    onMarkerDragged: PropTypes.func
  },

  getDefaultProps: function() {

    return {
      enabled: true,
      draggableMarker: false,
      scrollable: true,
      resetZoom: true
    }

  },

  getInitialState: function() {

    return {}

  },

  isGeolocated: function() {

    return this.props.location.latitude !== undefined;

  },

  componentDidMount: function() {

    this.initMap();

    if ( this.isGeolocated() ) {

      this.updateMarker();

    }

  },

  componentDidUpdate: function() {

    this.updateMarker();

  },

  initMap: function() {

    var pos = this.getPos(),

    mapOptions = {
      scrollWheelZoom: this.props.scrollable && this.props.enabled,
      dragging: this.props.enabled,
      zoomControl: this.props.enabled,
      tap: this.props.enabled,
      touchZoom: this.props.enabled
    };

    if ( this.isGeolocated() ) {

      this.map = L.map( this.mapRef, mapOptions ).setView( pos, this.props.defaultZoom || defaults.focusedZoom );

    } else {

      this.map = L.map( this.mapRef, mapOptions ).setView( defaults.pos, this.props.defaultZoom || defaults.zoom );

    }

    L.tileLayer( defaults.tiles, {
      //attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo( this.map );

  },

  updateMarker: function() {

    log( 'updateMarker' );

    if ( !this.isGeolocated() ) return;

    var pos = this.getPos();

    if ( !this.marker ) {

      this.initMarker();

    }

    this.marker.setLatLng( pos );

    const defaultZoom = this.props.defaultZoom || defaults.focusedZoom;

    this.map.setZoom( this.props.resetZoom ? defaultZoom : this.map.getZoom() );

    this.map.setView( pos );

  },

  initMarker: function() {

    var self = this,

    pos = this.getPos(),

    icon = L.icon( {
      iconAnchor: defaults.iconAnchor,
      iconUrl: defaults.markerIcon
    } );

    this.marker = L.marker( pos, {
      icon: icon,
      draggable: this.props.enabled
    } ).addTo( this.map );

    if ( !this.props.draggableMarker || !this.props.enabled ) return;

    this.marker.on( 'dragend', function( e ) {

      self.map.panTo( self.marker.getLatLng() );

      setTimeout( function() {

        self.props.onMarkerDragged( {
          latitude: e.target._latlng.lat,
          longitude: e.target._latlng.lng
        });

      }, 100 );

    } );

  },

  getPos: function() {

    return [ this.props.location.latitude, this.props.location.longitude ];

  },

  render: function() {

    return <div className="map" ref={r => this.mapRef = r}></div>

  }

} );

function log() {

  //console.log.apply( console, arguments );

}

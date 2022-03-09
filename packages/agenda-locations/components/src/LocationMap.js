import React, { Component } from 'react';
import debug from 'debug';
import PropTypes from 'prop-types';
import L from 'leaflet';

const log = debug('LocationMap');

const defaults = {
  tiles:
    '//api.mapbox.com/styles/v1/kaore/ckhn90pz00mut19pi1pt29nhi/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow',
  markerIcon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png',
  pos: [40, 0],
  iconAnchor: [9, 25],
  zoom: 2,
  focusedZoom: 13,
};

class LocationMap extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    resetZoom: PropTypes.bool,
    defaultZoom: PropTypes.number,
    location: PropTypes.object.isRequired,
    draggableMarker: PropTypes.bool,
    scrollable: PropTypes.bool,
    onMarkerDragged: PropTypes.func,
    tiles: PropTypes.string.isRequired,
  };

  static defaultProps = {
    enabled: true,
    draggableMarker: false,
    scrollable: true,
    resetZoom: true,
  };

  componentDidMount() {
    this.initMap();

    if (this.isGeolocated()) {
      this.updateMarker();
    }
  }

  componentDidUpdate() {
    this.updateMarker();
  }

  getPos() {
    const { location } = this.props;
    return [location.latitude, location.longitude];
  }

  isGeolocated() {
    const { location } = this.props;
    return location.latitude !== undefined;
  }

  initMap() {
    const {
      scrollable, enabled, defaultZoom, tiles
    } = this.props;
    const pos = this.getPos();
    const mapOptions = {
      scrollWheelZoom: scrollable && enabled,
      dragging: enabled,
      zoomControl: enabled,
      tap: enabled,
      touchZoom: enabled,
    };

    if (this.isGeolocated()) {
      this.map = L.map(this.mapRef, mapOptions).setView(
        pos,
        defaultZoom || defaults.focusedZoom
      );
    } else {
      this.map = L.map(this.mapRef, mapOptions).setView(
        defaults.pos,
        defaultZoom || defaults.zoom
      );
    }

    L.tileLayer(tiles, {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(this.map);
  }

  updateMarker() {
    log('updateMarker');

    if (!this.isGeolocated()) return;

    const { defaultZoom, resetZoom } = this.props;
    const pos = this.getPos();

    if (!this.marker) {
      this.initMarker();
    }

    this.marker.setLatLng(pos);

    const newDefaultZoom = defaultZoom || defaults.focusedZoom;

    this.map.setZoom(resetZoom ? newDefaultZoom : this.map.getZoom());

    this.map.setView(pos);
  }

  initMarker() {
    const { enabled, draggableMarker, onMarkerDragged } = this.props;
    const pos = this.getPos();
    const icon = L.icon({
      iconAnchor: defaults.iconAnchor,
      iconUrl: defaults.markerIcon,
    });

    this.marker = L.marker(pos, {
      icon,
      draggable: enabled,
    }).addTo(this.map);

    if (!draggableMarker || !enabled) return;

    this.marker.on('dragend', e => {
      this.map.panTo(this.marker.getLatLng());

      setTimeout(() => {
        onMarkerDragged({
          latitude: e.target._latlng.lat,
          longitude: e.target._latlng.lng,
        });
      }, 100);
    });
  }

  render() {
    return <div className="map" ref={r => (this.mapRef = r)} />;
  }
}

export default LocationMap;

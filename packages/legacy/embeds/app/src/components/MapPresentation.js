import React from 'react';

import {
  MapContainer, TileLayer
} from 'react-leaflet';

import { Helmet } from 'react-helmet-async';

export default ({
  tiles
}) => (
  <div>
    <Helmet>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <script
        src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
        integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
        crossOrigin=""
      />
    </Helmet>
    <MapContainer center={[47.1413835095447, 2.7386084664240578]} zoom={4} scrollWheelZoom={false} style={{ height: '220px', maxWidth: '220px' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url={tiles}
      />
    </MapContainer>
  </div>
);

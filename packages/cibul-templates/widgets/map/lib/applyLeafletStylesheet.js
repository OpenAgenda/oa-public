'use strict';

const du = require('@openagenda/dom-utils');

module.exports = () => {
  if (typeof document.createStyleSheet == "undefined") {
    const link = document.createElement('link');

    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', '//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.css');

    du.el('head').appendChild(link);
  } else {
    document.createStyleSheet(config.leafletCss);
    document.createStyleSheet(config.leafletCssIE);
  }
}
(function() {

  var params = {
    selectors: {
      cornersInput: '.js_map_corners'
    }
  };

  window.onBoundsChange = function(newBounds) {

    el(params.selectors.cornersInput).value = [newBounds.neLat, newBounds.neLng, newBounds.swLat, newBounds.swLng].join('|');

  };

})();
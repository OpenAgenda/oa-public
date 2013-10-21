var mapSearchHandler = function(params) {

  var params = extend({
    mapElt: false,
    template: '<input type="text"/><label><%= searchInfo %></label>',
    labels: {
      searchInfo: 'type the name of a place or a city'
    },
    onSelect: false, // callback for when a place is picked
    locations: []  // list of locations of program
  }, params);

  var sIndex = {}, elem,

  run = function() {

    _createIndex();

    _createElement();

    handleSuggestions(el(elem, 'input'), sIndex, 'name', '<div><%= name %></div>', {
      onSelect: function(selection) {
        params.onSelect(selection.corners);
      }
    });

  },

  _createIndex = function() {

    forEach(params.locations, function(location) {

      _index(location.placename, location.latitude, location.longitude);

      _index(location.city, location.latitude, location.longitude);

      _index(location.country, location.latitude, location.longitude);

    });

    var tmp = sIndex;

    sIndex = [];

    for (name in tmp) {

      sIndex.push({name: name, corners: tmp[name]});

    };

  },

  _index = function(name, latitude, longitude) {

    if (!name || !name.length) return;

    if (!isDef(sIndex[name])) {

      sIndex[name] = {ne: [latitude, longitude], sw: [latitude, longitude]};

    } else {

      if (sIndex[name].ne.latitude < latitude) sIndex[name].ne.latitude = latitude;
      if (sIndex[name].ne.longitude < longitude) sIndex[name].ne.longitude = longitude;
      if (sIndex[name].sw.latitude > latitude) sIndex[name].sw.latitude = latitude;
      if (sIndex[name].sw.longitude > longitude) sIndex[name].sw.longitude = longitude;

    }

  },

  _createElement = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.template }).render(params.labels);

    params.mapElt.parentNode.appendChild(elem);

  };

  run();

}
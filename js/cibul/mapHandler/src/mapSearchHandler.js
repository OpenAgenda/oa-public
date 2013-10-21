var mapSearchHandler = function(params) {

  var params = extend({
    canvas: false,
    template: '<input type="text"/><label><%= searchInfo %></label>',
    labels: {
      searchInfo: 'type the name of a place or a city'
    },
    onLocationSelect: false, // callback for when a place is picked
    onSelect: false, // callback for when a city or country is picked. A place too if the other callback is not set
    locations: [],  // list of locations of program
    classes: {
      contextMenu: 'context-menu'
    }
  }, params);

  var sIndex = {}, elem,

  run = function() {

    _createIndex();

    _createElement();

    handleSuggestions(el(elem, 'input'), sIndex, 'name', '<div><%= name %></div>', {
      contextMenuClass: params.classes.contextMenu,
      onSelect: function(selection) {

        if (selection.id && params.onLocationSelect) {
          params.onLocationSelect(selection.id);
        } else {
          params.onSelect(selection.corners);  
        }

      }
    });

  },

  _createIndex = function() {

    forEach(params.locations, function(location) {

      _index(location.placename, location);

      _index(location.city, location);

      _index(location.country, location);

    });

    var tmp = sIndex;

    sIndex = [];

    for (name in tmp) {

      var index = {name: name, score: tmp[name].score, corners: {ne: tmp[name].ne, sw: tmp[name].sw}};

      if (tmp[name]['id']) index['id'] = tmp[name]['id']; 

      sIndex.push(index);

    };

  },

  _index = function(name, location) {

    if (!name || !name.length) return;

    name = name.trim();

    if (!isDef(sIndex[name])) {

      sIndex[name] = {ne: [location.latitude, location.longitude], sw: [location.latitude, location.longitude], score: location.upcoming };

      // if this is a place, keep track of id to throw it in the callback
      if (location.placename==name) sIndex[name]['id'] = location.id;

    } else {

      if (sIndex[name].ne[0] < location.latitude) sIndex[name].ne[0] = location.latitude;
      if (sIndex[name].ne[1] < location.longitude) sIndex[name].ne[1] = location.longitude;
      if (sIndex[name].sw[0] > location.latitude) sIndex[name].sw[0] = location.latitude;
      if (sIndex[name].sw[1] > location.longitude) sIndex[name].sw[1] = location.longitude;

      sIndex[name].score += location.upcoming;

    }

  },

  _createElement = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.template }).render(params.labels);

    params.canvas.appendChild(elem);

  };

  run();

}
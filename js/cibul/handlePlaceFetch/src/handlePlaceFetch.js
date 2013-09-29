var handlePlaceFetch = function(params) {

  params = extend({
    canvas: false,
    get: false,
    country: {code: 'FR', name: 'France'},
    countries: false,
    onFetched: false,
    resource: false, // url to tap for getting location suggestions
    locations: [], // list of locations to choose from stored locally
    restrict: false, // if set to true, suggestions can only be picked from local selection
    labels: {
      fetchInfo: 'Type the name and address and select you location from the list',
      placename: 'Name',
      placenameInfo: 'Name of the place',
      address: 'Address',
      addressInfo: 'street number, street name, city, country',
      countryField: 'country name', 
      countryFieldInfo: 'type in a country name and click or press enter'
    },
    templates: {
      main: '<span class="info"><%= fetchInfo %></span><div></div>',
      countryLink: '<a href="#" class="url"><span class="js_country"></span><i class="icon-edit"></i></a>'
    },
    classes: {
      main: 'place-fetch input-fields',
      country: 'country action',
      contextMenu: 'context-menu'
    },
    selectors: {
      country: '.js_country'
    }
  }, params);

  var widgets = { placename: false, address: false }, addressEnabled, elem, countryElem, country = params.country,

  create = function() {

    _createElem();

    addressEnabled = false;

    // a widget for creating the name

    widgets.placename = new inputWidgets.text({
      label: params.labels.placename,
      placeholder: params.labels.placename,
      name: 'placename', 
      canvas: el(elem, 'div'), 
      info: params.labels.placenameInfo, 
      events: ['change', 'keyup'], 
      onUpdate: _buildNameSuggestions
    });

    // keep address widget disabled as long as place name has not been typed

    widgets.address = new inputWidgets.text({
      label: params.labels.address,
      placeholder: params.labels.address, 
      name: 'address', 
      canvas: el(elem, 'div'), 
      info: params.labels.addressInfo, 
      events: ['change', 'keyup'], 
      onUpdate: _buildAddressSuggestions,
      enabled: false
    });

    // show country link

    _createCountryLink();

    return this;

  },

  remove = function() {

    if (widgets.placename) {
      widgets.placename.remove();
      delete widgets.placename;
    };

    if (widgets.address) {
      widgets.address.remove();
      delete widgets.address;
    };

    elem.parentNode.removeChild(elem);

  },

  _buildNameSuggestions = function(placename) {

    var address = widgets.address?widgets.address.get():'';

    if (!placename.length || address.length) return;

    if (!addressEnabled) {
      widgets.address.enable();
      addressEnabled = true;
    }

    var suggestions = _shortlist(placename, params.locations, 'name');

    if (placename.length > 2) 
      _fetch({placename: placename}, suggestions);
    else
      if (suggestions.length && params.onFetched) params.onFetched(suggestions);

    if (params.onChange) params.onChange({name: placename, address: address});

  },

  _buildAddressSuggestions = function(address) {

    if (address.length > 2) _fetch({address: address, country: country.code});

    if (params.onChange) params.onChange({name: widgets.placename.get(), address: address, country: country.code});

  },

  _fetch = function(query, suggestions) {

    if (!suggestions) suggestions = [];

    params.get(query, function(fetchedSuggestions) {

      forEach(fetchedSuggestions, function(fetchedSuggestion){

        // will need to filter out already listed locations here eventually

        suggestions.push(fetchedSuggestion);

      });

      if (suggestions.length && params.onFetched) params.onFetched(suggestions);

    });

  },

  _shortlist = function(value, list, key) {

    var regex = ''
      , subset = [];

    forEach (value, function(c) {
      regex += '.*' + c.toLowerCase();
    });

    regex = new RegExp(regex);

    forEach(list, function(listItem) {
      if (listItem[key].toLowerCase().match(regex)) subset.push(listItem);
    });

    return subset;

  },

  _createElem = function() {

    elem = document.createElement('div');

    elem.className = params.classes.main;

    elem.innerHTML = new EJS({text: params.templates.main}).render(params.labels);

    params.canvas.appendChild(elem);

  },

  _createCountryLink = function() {

    countryElem = document.createElement('div');
    countryElem.innerHTML = params.templates.countryLink;
    countryElem.className = params.classes.country;

    el(countryElem, params.selectors.country).innerHTML = country.name;

    elem.appendChild(countryElem);

    addEvent(el(countryElem, 'a'), 'click', function(e) {
      
      preventDefault(e);

      el(countryElem, 'a').style.display = 'none';

      _showCountrySelect();

    });

  },

  _showCountrySelect = function() {

    var cParams = {
      classes: {
        contextMenu: params.classes.contextMenu
      },
      labels: params.labels,
      focus: true,
      canvas: countryElem,
      onSelect: function(newCountry) {

        country = newCountry;

        el(countryElem, params.selectors.country).innerHTML = country.name;
        
        el(countryElem, 'a').style.display = 'inline';
        ic.remove();

      }
    };

    if (params.countries) cParams.countries = params.countries;

    var ic = inputCountry(cParams);

  };

  return {
    create: create,
    remove: remove
  }

}
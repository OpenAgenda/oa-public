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
      addressNumberInfo: 'street number',
      addressStreetInfo: 'street name',
      addressCityInfo: 'city',
      countryField: 'country name', 
      countryFieldInfo: 'type in a country name and click or press enter'
    },
    templates: {
      main: '<span class="info"><%= fetchInfo %></span><div></div><div class="js_country_canvas"><a href="#" class="url"><span class="js_country"></span><i class="icon-edit"></i></a></div></div><div class="js_loader loader"></div>',
      addressGuide: '<span><%= addressNumberInfo %></span> <span><%= addressStreetInfo %></span>, <span><%= addressCityInfo %></span></span>'
    },
    spinner: { lines: 7, length: 1, width: 2, radius: 3, corners: 0, rotate: 0},
    classes: {
      main: 'place-fetch input-fields cform',
      country: 'country action',
      contextMenu: 'context-menu',
      addressGuide: 'info',
      highlight: 'highlight'
    },
    selectors: {
      countryCanvas: '.js_country_canvas',
      country: '.js_country',
      loader: '.js_loader'
    }
  }, params);

  var widgets = { placename: false, address: false }, addressEnabled, elem, countryElem, country = params.country,

  loading = false, spinner, addressGuide,

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
      onUpdate: function(address) {
        _buildAddressSuggestions(address);
        _updateAddressGuide(address);
      },
      enabled: false
    });

    _createAddressGuide(el(elem, 'div'));

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

    _loading();

    params.get(query, function(fetchedSuggestions) {

      _notLoading();

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

    countryElem = el(elem, params.selectors.countryCanvas);
    countryElem.className = params.classes.country;

    el(countryElem, params.selectors.country).innerHTML = country.name;

    addEvent(el(countryElem, 'a'), 'click', function(e) {
      
      preventDefault(e);

      el(countryElem, 'a').style.display = 'none';

      _showCountrySelect();

    });

  },

  _createAddressGuide = function(canvasElem) {

    addressGuide = document.createElement('span');

    addressGuide.className = params.classes.addressGuide;

    addressGuide.innerHTML = new EJS({text: params.templates.addressGuide }).render(params.labels);

    canvasElem.appendChild(addressGuide);

    _updateAddressGuide();

  },

  _updateAddressGuide = function(address) {

    if (!addressGuide) return;

    if(!address) address = '';

    var hIndex = false;

    if (address.match(/^([0-9]+|)$/))
      hIndex = 0;
    else if (address.match(/^[0-9]+\s[A-Za-z\u00C0-\u017F\s']+$/))
      hIndex = 1;
    else if (address.match(/^[0-9]+\s[A-Za-z\u00C0-\u017F\s']+,.+$/))
      hIndex = 2;

    var spanElems = els(addressGuide, 'span');

    for (var i = spanElems.length - 1; i >= 0; i--) {

      if (i===hIndex) 
        addClass(spanElems[i], params.classes.highlight);
      else
        removeClass(spanElems[i], params.classes.highlight);

    };

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

        var oldCountry = country;

        country = newCountry;

        if (oldCountry !== country) {

          _buildAddressSuggestions(widgets.address.get());

        }

        el(countryElem, params.selectors.country).innerHTML = country.name;
        
        el(countryElem, 'a').style.display = 'inline';
        ic.remove();

      }
    };

    if (params.countries) cParams.countries = params.countries;

    var ic = inputCountry(cParams);

  },

  _loading = function(selector) {

    if (loading) return;

    loading = true;

    if (!spinner) spinner = new Spinner(params.spinner);

    spinner.spin();

    el(elem, params.selectors.loader).appendChild(spinner.el);

  },

  _notLoading = function() {

    loading = false;

    spinner.stop();

  };

  return {
    create: create,
    remove: remove
  }

}
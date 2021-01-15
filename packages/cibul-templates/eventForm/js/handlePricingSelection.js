var handlePricingSelection = function(params) {

  params = extend({
    location: false,
    canvas: false,
    template: '<p><%= pricingInfo %></p><div class="pricing-info js_pricing_info input-fields"></div><div class="ticket-link input-fields js_ticket_link"></div>',
    selectors: {
      pricingInfo: '.js_pricing_info',
      ticketLink: '.js_ticket_link'
    },
    labels: {
      ticketLink: 'Ticket link',
      ticketLinkInfo: 'If you have a link to a ticketing service, set it here',
      pricingInfo: 'Pricing information',
      pricingInfoInfo: 'Details about pricing'
    },
    onChange: false,
    languages: false, // required - languages used for ticket info
  }, params);

  var languages = params.languages, linkWidget, pricingWidgets = {}, elems = [], ticketLink, pricingInfo, pricingInfoElems = {},

  _run = function() {

    ticketLink = params.location.ticketLink?params.location.ticketLink:{};
    
    pricingInfo = _initPricingInfo( params.location.pricingInfo, params.languages );

    _createElement();

    _createFields();

  },

  _initPricingInfo = function( p, languages ) {

    var clean = {};

    if ( typeof p == 'undefined' ) p = {};

    forEach( languages, function( l ) {

      clean[ l ] = p[ l ] ? p[ l ] : '';

    });

    return clean;

  },

  _createElement = function() {

    var canvas = document.createElement('div');
    canvas.innerHTML = new EJS({text: params.template}).render(params.labels);

    var child;

    while (child = childObject(canvas,0)) {
      elems.push(child);
      params.canvas.appendChild(child);
    }
      
  },

  _createFields = function() {

    linkWidget = new inputWidgets.text({
      value: params.location.ticketLink?params.location.ticketLink:false,
      label: params.labels.ticketLink,
      placeholder: params.labels.ticketLink,
      name: 'ticketlink',
      canvas: el(params.canvas, params.selectors.ticketLink),
      info: params.labels.ticketLinkInfo,
      onUpdate: function(value) {

        ticketLink = value; // validation?

        _onChange();

      }
    });

    forEach(languages, function(lang) {

      _addPricingWidget(lang, params.location?(params.location.pricingInfo?(params.location.pricingInfo[lang]?params.location.pricingInfo[lang]:false):false):false);

    });

  },

  _onChange = function() {

    if (params.onChange) params.onChange(ticketLink, pricingInfo);

  },

  _addPricingWidget = function(lang, value) {

    if (!isDef(value)) value = false;

    var label = params.labels.pricingInfo + ' (' + params.labels.languages[lang] + ')';

    if (!isDef(pricingInfoElems[lang])) {
      pricingInfoElems[lang] = document.createElement('div');
      el(params.canvas, params.selectors.pricingInfo).appendChild(pricingInfoElems[lang]);
    }

    pricingWidgets[lang] = new inputWidgets.text({
      value: value,
      placeholder: params.labels.pricingInfoInfo,
      name: 'pricingInfo[' + lang + ']',
      canvas: pricingInfoElems[lang],
      info: params.labels.languages[lang],
      onUpdate: function(value) {

        pricingInfo[lang] = value; // validation?

        _onChange();

      }
    });

  },

  updateLanguages = function(newLanguages) {

    forEach(languages, function(lang) {
      if (!contains(newLanguages, lang)) {
        // lang was removed

        if (pricingWidgets[lang]) pricingWidgets[lang].remove();

        el(params.canvas, params.selectors.pricingInfo).removeChild(pricingInfoElems[lang]);
        pricingInfoElems[lang] = undefined;

        pricingWidgets[lang] = undefined;

        delete pricingInfo[lang];

      }
    });

    forEach(newLanguages, function(lang) {
      if (!contains(languages, lang)) _addPricingWidget(lang);
    });

    languages = newLanguages;

    _onChange();

  };

  _run();

  return {
    updateLanguages: updateLanguages
  };

};
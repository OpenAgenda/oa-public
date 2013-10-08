var extractLocation = function(locations, item){

  if (typeof locations[item.locationSlug] == 'undefined') locations[item.locationSlug] = {
    placename: item.location.p,
    address: item.location.a,
    categories: [],
    tags: [],
    dates: [],
    lat: item.location.lt,
    lng: item.location.lg
  };

  // add category
  if (typeof item.article.c !='undefined') if (item.article.c.length) if (!contains(locations[item.locationSlug].categories, item.article.c)) 
    locations[item.locationSlug].categories.push(item.article.c);

  // add tags
  if (typeof item.article.t != 'undefined') if (item.article.t.length) forEach(item.article.t, function(tag){
    if (!contains(locations[item.locationSlug].tags, tag))
      locations[item.locationSlug].tags.push(tag);
  });

  // add dates
  forEach(item.location.d, function(date) {
    if (!contains(locations[item.locationSlug].dates, date))
      locations[item.locationSlug].dates.push(date);
  });

};


var addLocationListBehavior = function(locationListElem, locations, eventHandler, params) {

  params = extend({
    triggeredEvents: {locationSelect: 'newSelect'},
    triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail', resize: 'resize'},
    template: '<ul><% for (className in locationSlugSets) { %><% for (var i=0; i<locationSlugSets[className].length; i++) { var slug = locationSlugSets[className][i]; %><li class="<%= className %> filter-item" data-slug="<%= slug %>"><i class="icon-remove"></i><span class="placename"><%= locations[slug].placename %></span><span class="address"><%= locations[slug].address %></span></li><% } %><% } %></ul>',
    activeClass: 'active'
  }, params);

  var disabled = false, iscroll = false;

  var init = function() {

    var ejsTemplate = new EJS({ text: params.template });

    var render = ejsTemplate.render({locations: locations, locationSlugSets: splitLocations(locations)});

    locationListElem.innerHTML = render;

    // because not for ie8
    if (document.addEventListener) 
      iscroll = new iScroll('location-list-wrapper');
    else
      el('#location-list-wrapper').style.overflowY = 'scroll';

    if (Object.size(locations) > 1) forEach(els(locationListElem, 'li'), function(listItem) {
      addEvent(listItem, 'click', function(e){
        if (disabled) return;
        eventHandler.trigger(params.triggeredEvents.locationSelect, {location: listItem.getAttribute('data-slug')});
      });

      addEvent(el(listItem, '.icon-remove'), 'click', function(){
        if (disabled) return;
        eventHandler.trigger(params.triggeredEvents.locationSelect, {location: null});
      });
    });

    eventHandler.on(params.triggerEvents.loadSuccess, function(data){
      disabled = false;

      if (data.location) {
        forEach(els(locationListElem, 'li'), function(listItem) { 

          if (listItem.getAttribute('data-slug')==data.location) {
            addClass(listItem, params.activeClass);
            if (iscroll) iscroll.scrollToElement(listItem);
          }

        });
      }

    });

    eventHandler.on(params.triggerEvents.resize, function() {
      if (iscroll) iscroll.refresh();
    });

    eventHandler.on(params.triggerEvents.loading, function(){
      disabled = true;

      forEach(els(locationListElem, 'li'), function(listItem) { 
        removeClass(listItem, params.activeClass);
      });
      
    });

  };


  var splitLocations = function(locations) {

    var today = new Date(),
      section, d, split = {upcoming: [], passed: []};
    today.setHours(0,0,0,0);

    for (slug in locations) {

      section = 'passed';

      forEach(locations[slug].dates, function(date) {

        d = new Date(date);

        if (d>today) {
          section = 'upcoming';
          return;
        }

      });

      split[section].push(slug);

    };

    return split;

  };

  init();

};
var extractLocation = function(locations, item){

  if (typeof locations[item.locationSlug] == 'undefined') {
    
    locations[item.locationSlug] = {
      placename: item.location.p,
      address: item.location.a,
      categories: [],
      tags: [],
      dates: [],
      lat: item.location.lt,
      lng: item.location.lg,
      events: []
    };

    // add optional fields
    if (item.location.i) locations[item.locationSlug].image = item.location.i;
    if (item.location.ct) locations[item.locationSlug].city = item.location.ct;
    if (item.location.cn) locations[item.locationSlug].country = item.location.cn;

  }

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

  // add event uids
  if (!contains(locations[item.locationSlug].events, item.article.u)) locations[item.locationSlug].events.push(item.article.u);

};
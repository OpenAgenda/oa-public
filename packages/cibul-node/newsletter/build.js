/**
 * prepare the data for the newsletter render
 * based on the agenda and campaign
 */

module.exports = function( model, agenda, campaign, cb ) {

  log('building newsletter data');

  async.waterfall([ 

    function( wcb ) { wcb( null, model, agenda, campaign, {} );  },

    mainInfo,         // load main info for newsletter

    contactList,      // retrieved contact list uid

    featuredEvents,   // load featured events selection

    eventSelection    // load event selection based on campaign filter and segmentation settings

  ], function( err, model, agenda, campaign, data ) {

    if ( err ) return cb( err );

    cb( null, data );

  });

};

var async = require('async'),

lib = require('../lib/lib'),

log = require('../lib/logger')( 'newsletter/build' ),



/**
 * load campaign main info (title, edito) in newsletter data
 */

mainInfo = function( model, agenda, campaign, data, cb ) {

  log('generating main info');

  campaign.getEdito(function( err, edito ) {

    lib.extend(data, {
      layout: {
        title : agenda.title,
        preheaderContent: agenda.title + ' - Newsletter'
      },
      slug: agenda.slug,
      uid: agenda.uid,
      campaignUid: campaign.uid,
      title: agenda.title,
      edito : edito,
      agendaUrl: agenda.url,
      image : agenda.getImage( true ),
      featuredEvents : [],
      items: [],
      contributable: agenda.contributionType !== 0
    });

    cb( null, model, agenda, campaign, data );

  });

},


/**
 * retrieve contact list uid for unsubscribe link
 */

contactList = function( model, agenda, campaign, data, cb ) {

  log('retrieving contact list');

  campaign.getContactList(function( err, contactList ) {

    data.contactListUid = false;

    if ( err ) return cb( err );

    if ( contactList ) {

      data.contactListUid = contactList.uid;

    }

    cb( null, model, agenda, campaign, data );

  });

},



/**
 * load featured events if any
 */

featuredEvents = function( model, agenda, campaign, data, cb ) {

  log('retrieving featured events');

  campaign.events.list({ filters: { set: 'featured' }, limit: false }, function( err, events ) {

    if ( err ) return cb( err );

    data.featuredEvents = events.map( function( event ) {

      var e = model.events().instance( event );

      return {
        title: e.getTitle(),
        description: e.getDescription(),
        freeText: e.getFreeText(),
        slug: e.slug,
        image: e.getImage( true ),
        spaceTimeInfo: e.getSpaceTimeInfo()
      };          

    });

    cb( null, model, agenda, campaign, data );  

  });

  

},


/**
 * define selection as per filter settings of campaign
 */

eventSelection = function( model, agenda, campaign, data, cb ) {

  log('retrieving event selection');

  async.parallel([

    async.apply( campaign.getFilters ),
    async.apply( campaign.getSegmentation )

  ], function( err, results ) {

    if ( err ) return cb( err );

    var filters = results[0],

    segmentation = results[1],

    listMethod = segmentation ? 'segmented' : 'list',

    listParams = { upcoming: true, limit: false };

    ['cities', 'regions', 'departments'].forEach(function( filter ) {

      if ( filters[filter] && filters[filter].length ) listParams[filter] = filters[filter];

    });

    if ( filters.category ) listParams.categorySlug = filters.category;

    if ( segmentation ) listParams.segments = [segmentation];

    agenda.events[listMethod]( listParams, function( err, events ) {

      if ( err ) return cb( err );

      var previousSegment;

      events.forEach(function( event ) {

        var e = model.events().instance( event );

        if ( previousSegment !== JSON.stringify( event.segments ) ) {

          // add segment item

          data.items.push(getSegment(event.segments));

        }

        data.items.push({
          itemType: 'event',
          title: e.getTitle(),
          description: e.getDescription(),
          slug: e.slug,
          image: e.image,
          spaceTimeInfo: e.getSpaceTimeInfo()
        });

        if ( event.segments ) previousSegment = JSON.stringify( event.segments );

      });

      cb( null, model, agenda, campaign, data );

    });

  });

},

getSegment = function( segments ) {

  for ( var s in segments ) {}  // Lets get to the bottom of this. ... AHAHHAHHAHAA.. Its friday.

  var text = segments[s];

  if ( !text ) {

    text = false;

  } else if ( typeof text !== 'string' ) {

    text = text.label;

  }

  return {
    itemType: 'segment',
    type: s,
    text: text
  };

};
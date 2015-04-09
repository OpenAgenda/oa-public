var log = require( '../lib/logger' )( 'nominatim task' ),

lib = require( '../lib/lib' ),

cmn = require( '../lib/commons-task' ),

model = cmn.getCibulModel(),

async = require( 'async' ),

france = require( '../services/nominatim/franceCleaner' ),

nom = require( '../services/nominatim/nominatim' ),

running = false,

_onComplete,

_onStart,

requestInterval = 2000,


// map of db fields by nominatim fields
map = {
  countryCode : 'country',
  city : 'city',
  cityDistrict : 'city_district',
  state : 'state',
  postalCode : 'postal_code',
  region : 'region'
};


/**
 * exported function list
 */

exports.load = cmn.makeLoad( run );     // load task using offset and period
exports.run = run;                      // run task

// for testing
exports.setOnStart = setOnStart;        // task is running
exports.setOnComplete = setOnComplete;  // task has completed a run


/**
 * execute the task
 */

function run() {

  if ( running ) {

    log( 'already running' );

    return;

  }

  log( 'running' );

  running = true;

  done = false;

  if ( _onStart ) _onStart();

  async.doWhilst( function( wcb ) {

    model.locations().list( { processedAt: null }, function( err, locations ) {

      if( !locations.length ) {

        log( 'there are no more locations to process right now' );

        done = true;

        wcb();

        return;

      }

      log( 'processing %s locations', locations.length );

      async.eachSeries( locations, function( l, escb ) {

        log( 'processing location %s', l.id );

        nom.reverse( l.latitude, l.longitude, { language: 'fr' }, function( err, result ) {
          
          var updates = { store:{} };

          if ( err ) {

            log( 'got an error while processing location %s: %s', l.id, err );

            updates.store.nomimatErr = err;

          } else {

            log( 'reverse geocode went well for location %s', l.id );

            var parsedData = france( nom.clean( result ) );

            if (parsedData.city && !l.city) updates.city = parsedData.city;

            if (parsedData.country_code && !l.country) updates.country = parsedData.country_code;

            if (parsedData.department) updates.department = parsedData.department;

            if (parsedData.region) updates.region = parsedData.region;

            if (parsedData.cityDistrict) updates.cityDistrict = parsedData.cityDistrict;

            if (parsedData.postalCode) updates.postalCode = parsedData.postalCode;

            updates.processedAt = new Date();
            
          }


          model.locations().update( { id: l.id } , updates, function( err ) {

            log( 'location %s updated, waiting %s seconds to process next', l.id, requestInterval );

            setTimeout( function() { escb(); }, requestInterval );

          });

        });


      }, wcb );

    });

  },

  function() {

    return !done;

  },

  function( err ) {

    if ( err ) {

      log( 'nominatim task error: %s', err );

    }

    running = false;

    if ( _onComplete ) _onComplete();

  });

};

function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}
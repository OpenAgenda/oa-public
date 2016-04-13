var log = require( 'logger' )( 'nominatim task' ),

lib = require( '../lib/lib' ),

coms = require( '../lib/coms' ),

config = require( '../config' ),

model = require( '../services/model' ),

async = require( 'async' ),

france = require( '../services/nominatim/franceCleaner' ),

nom = require( '../services/nominatim/nominatim' ),

geocode = require( 'agenda-locations' ).utils.geocode,

running = false,

_onComplete,

_onStart,

requestInterval = 4000,

requestIntervalAfterFail = 120000,


// map of db fields by nominatim fields
map = {
  countryCode : 'country',
  city : 'city',
  cityDistrict : 'city_district',
  state : 'state',
  postalCode : 'postal_code',
  region : 'region'
};



module.exports = run;

// for testing
module.exports.setOnStart = setOnStart;        // task is running
module.exports.setOnComplete = setOnComplete;  // task has completed a run


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

        nom.reverse( l.latitude, l.longitude, {
          language: 'fr',
          email: config.adminEmail
        }, function( err, result ) {
          
          var updates = { store: l.store || {} }, 

          interval = requestInterval;

          if ( err ) {

            log( 'error', 'got an error while processing location %s: %s', l.id, err );

            updates.store.nomimatErr = err;

            interval = requestIntervalAfterFail;

          } else {

            log( 'reverse geocode went well for location %s', l.id );

            var parsedData = france( nom.clean( result ) );

            if ( parsedData.city && !l.city ) updates.city = parsedData.city;

            if ( parsedData.country_code && !l.country ) updates.country = parsedData.country_code;

            if ( parsedData.department && !l.department ) updates.department = parsedData.department;

            if ( parsedData.region && !l.region ) {

              updates.region = parsedData.countryCode == 'FR' ? geocode.clean.frenchRegion( parsedData.region ) : parsedData.region;

            }

            if ( parsedData.cityDistrict && !l.cityDistrict ) updates.cityDistrict = parsedData.cityDistrict;

            if ( parsedData.postalCode && !l.postalCode ) updates.postalCode = parsedData.postalCode;
            
          }

          updates.processedAt = new Date();


          model.locations().update( { id: l.id } , updates, function( err ) {

            log( 'info', {
              message: 'updated location',
              location: JSON.stringify( l ),
              locationId: l.id,
              update: JSON.stringify( updates )
            } );

            log( 'location %s updated, waiting %s seconds to process next', l.id, interval );

            // update related events - it is quite unlikely that at the time of nominatim processes
            // the location there will more than a handful of events associated to it
            // so I am skipping the thorough request loop
            model.locations().instance( { id: l.id } ).events.list( function( err, events ) {

              events.forEach( function( e ) {

                coms.publish( config.mainChannel, { name: 'event.update', values: { id: e.id } } );

              } );

            } );

            setTimeout( function() { escb(); }, interval );

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
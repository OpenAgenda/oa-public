"use strict";

const log = require( '@openagenda/logs' )( 'associateFreeLocations' );

var db = require( '../lib/db' ),

search = require( '../lib/search' ),

async = require( 'async' );

/**
 * go through all db locations where no agenda_id is set, and evaluate for each location
 * wether or not it can be associated to an agenda. If that location is only
 * associated to events linked to one and only agenda, then yes.
 */

module.exports = function( cb ) {

  if ( !db.isReady() || !search.isReady() ) {

    return cb( 'search or db not ready' );

  }

  _loopThroughAllTheUnassociatedLocations( ( location, lcb ) => {

    let con = db.getConnection();

    con.query( `
      select distinct a.id from review as a
      left join review_article as ra on ra.review_id=a.id
      left join event_location as el on el.event_id=ra.event_id
      left join location as l on el.location_id=l.id
      where l.uid = ${location.uid}`,
    ( err, rows ) => {

      if ( rows.length !== 1 ) {

        con.end();

        lcb();

      } else {

        con.query( `update location set agenda_id=${rows[0].id} where uid=${location.uid}`, ( err, result ) => {

          con.end();

          log( 'updated location %s with agenda id %s', location.uid, rows[ 0 ].id );

          db.get( { uid: location.uid }, ( err, location ) => {

            // attempt search index update

            search.update( location, err => {

              if ( !err ) {

                log( 'updated search index for location %s', location.uid );

                return lcb();

              }

              search.create( location, ( err, result ) => {

                if ( err ) {

                  log( 'error', 'could not create entry in search index for location %s: %s', location.uid, err );

                } else {

                  log( 'created entry in search index for location %s', location.uid );

                }

                lcb();

              } );

            } );

          } );

        } );

      }

    } );

  } );

}


module.exports.test = {
  _loopThroughAllTheUnassociatedLocations: _loopThroughAllTheUnassociatedLocations
}


function _loopThroughAllTheUnassociatedLocations( lcb, cb ) {

  var hasMore = true, offset = 0, limit = 20;

  async.doWhilst( ( wcb ) => {

    db.list( { agendaId: null }, offset, limit, ( err, locations ) => {

      if ( err ) return wcb( err );

      offset += limit;

      hasMore = !!locations.length;

      async.eachSeries( locations, lcb, wcb );

    } );

  }, () => hasMore, cb );

              /**
               ─────────────────────────────▄██▄
                ─────────────────────────────▀███
                ────────────────────────────────█
                ───────────────▄▄▄▄▄────────────█
                ──────────────▀▄────▀▄──────────█
                ──────────▄▀▀▀▄─█▄▄▄▄█▄▄─▄▀▀▀▄──█
                ─────────█──▄──█────────█───▄─█─█
                ─────────▀▄───▄▀────────▀▄───▄▀─█
                ──────────█▀▀▀────────────▀▀▀─█─█
                ──────────█───────────────────█─█
                ▄▀▄▄▀▄────█──▄█▀█▀█▀█▀█▀█▄────█─█
                █▒▒▒▒█────█──█████████████▄───█─█
                █▒▒▒▒█────█──██████████████▄──█─█
                █▒▒▒▒█────█───██████████████▄─█─█
                █▒▒▒▒█────█────██████████████─█─█
                █▒▒▒▒█────█───██████████████▀─█─█
                █▒▒▒▒█───██───██████████████──█─█
                ▀████▀──██▀█──█████████████▀──█▄█
                ──██───██──▀█──█▄█▄█▄█▄█▄█▀──▄█▀
                ──██──██────▀█─────────────▄▀▓█
                ──██─██──────▀█▀▄▄▄▄▄▄▄▄▄▀▀▓▓▓█
                ──████────────█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                ──███─────────█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                ──██──────────█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                ──██──────────█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                ──██─────────▐█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                ──██────────▐█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
                ──██───────▐█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▌
                ──██──────▐█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▌
                ──██─────▐█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▌
                ──██────▐█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
               */
}

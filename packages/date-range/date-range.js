

var Labels = require('./labels');
var Months = Labels.months;
var dateFormatOneDate = Labels.oneDate;
var dateFormatTwoDates = Labels.twoDates;
var dateFormatMoreDates = Labels.moreDates;

// var d = console.log.bind( console, 'Info: ' );


/**
 * Represents a date range
 * @constructor
 *
 * @param {Array} data - Date range 
 * @param {Object} opts - Additionnal options
 * @param {String} opts.lang - Default language to be used for output
 * @return
 */

function render( template, data ){
  var out = template;
  Object.keys( data ).forEach( function(key){
    var regex = new RegExp( '%' + key + '%' );
    out = out.replace( regex, data[key], 'g' );
  });
  return out;
}


function getMonthYear( date, lang ){
  var monthyear = Months[ date.getMonth() ][lang];
  if( new Date().getUTCFullYear() != date.getUTCFullYear() ){
    monthyear =  monthyear +' ' + date.getUTCFullYear();
  }
  return monthyear;
}

function pad( str ){
  return ( '0' + str ).slice(-2);
}

function getTimes( range ){
  return range.map( function(timing){
    return [ timing.start.getUTCHours(), timing.start.getUTCMinutes() ].map( pad ).join( ':' );
  }).join(', ');
}


function DateRange( data, opts ){
  data = data || [];
  opts = opts || {};

  /*
   * range object will contains list of *Timing*
   * Each Timing will have format like { start: xxx, end: xxx }
   */
  this.range = data;
  this.lang = opts.lang || 'en';

  this.dateTimingHashMap = {};
  this.uniqDates = [];
  this.uniqDateCount = 0;

  this.initializeState();
}

DateRange.prototype = {


  /* Pre-calculate the values which are mostly used to make dicisions */
  initializeState: function(){
    this.range.forEach( function( v ){

      v.date = v.start.toISOString().slice(0,10);
      this.dateTimingHashMap[ v.date ] = v;

      if( this.uniqDates.indexOf( v.date ) == -1 ){
        this.uniqDates.push( v.date );
      }

    }, this );

    this.uniqDateCount = this.uniqDates.length;
  },


  toString: function( lang ){
    var out = '',
        data = {},
        date1, date2;
    lang = lang || this.lang;

    switch( this.uniqDateCount ){

      case 1:
        date1 = this.range[0].start;

        data.day = date1.getUTCDate();
        data.monthyear = getMonthYear( date1, lang );
        data.times = getTimes( this.range, lang );

        out = render( dateFormatOneDate[lang], data );
        break;
      case 2:
        date1 = this.dateTimingHashMap[ this.uniqDates[0] ];
        date2 = this.dateTimingHashMap[ this.uniqDates[1] ];

        data.firstdate = date1.start.getUTCDate();
        data.seconddate = date2.start.getUTCDate();
        data.monthyear = getMonthYear( date1.start, lang );
        out = render( dateFormatTwoDates[lang], data );
        break;
      default:
        date1 = this.dateTimingHashMap[ this.uniqDates[0] ];
        date2 = this.dateTimingHashMap[ this.uniqDates[ this.uniqDateCount -1 ] ];

        data.firstdate = date1.start.getUTCDate();
        data.lastdate = date2.start.getUTCDate();
        data.monthyear = getMonthYear( date1.start, lang );
        out = render( dateFormatMoreDates[lang], data );
        break;

    }

    return out;
  }

};

module.exports = DateRange;

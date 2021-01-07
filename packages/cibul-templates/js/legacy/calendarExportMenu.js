/**
 * this makes a google calendar link out of event data
 */

$.fn.makeCalendarLink = function(eData, service) {

  // calculate duration. if is negative, increment date of end and adjust

  var startTime = parseInt(eData.date.replace(/-/g, '') + eData.startTime.replace(/:/g, ''), 10);
  var endTime = parseInt(eData.date.replace(/-/g, '') + eData.endTime.replace(/:/g, ''), 10);


  // get slug
  var urlParts = eData.url.split('/');

  var slug = urlParts[urlParts.length -2];


  var duration = (endTime - startTime)/100;
  
  if (duration < 0) {

    // past midnight. increment date

    duration = duration + 2400;

    var date = new Date(eData.date);

    date.setDate(date.getDate()+1);

    eData.endDate = date.getFullYear() + '-' + ((date.getMonth() + 1 < 10)?'0'+(date.getMonth() + 1):(date.getMonth() + 1)) + '-' + date.getDate();

  } else {

    eData.endDate = eData.date;

  }

  duration = duration + '';

  while (duration.length < 4) { duration = '0' + duration; }

  if (typeof service == 'undefined') service = 'google';

  switch (service) {
    
    case 'yahoo':

      $(this).attr('href', 'http://calendar.yahoo.com/?v=60'
        + '&TITLE=' + encodeURIComponent(eData.title)
        + '&ST=' + eData.date.replace(/-/g, '') + 'T' + eData.startTime.replace(/:/g, '')
        + '&DUR=' + duration
        + '&in_loc=' + encodeURIComponent(eData.placename + ' - ' + eData.address)
        + '&DESC=' + encodeURIComponent(eData.description)
        + '&URL=' + eData.url);
      break;
    
    case 'live':

      $(this).attr('href', 'http://calendar.live.com/calendar/calendar.aspx?rru=addevent'
        + '&summary=' + encodeURIComponent(eData.title)
        + '&location=' + encodeURIComponent(eData.placename + ' - ' + eData.address)
        + '&dtstart=' + eData.date.replace(/-/g, '') + 'T' + eData.startTime.replace(/:/g, '')
        + '&dtend=' + eData.endDate.replace(/-/g, '') + 'T' + eData.endTime.replace(/:/g, '')
        + '&description=' + encodeURIComponent(eData.description + ' - ' + eData.url)
      );

      break;
    
    case 'icalendar':
      
      $(this).attr('href', (eData.url.indexOf('d.cibul.net')!==-1?'//d.cibul.net/frontend_dev.php/ical?':'//cibul.net/ical?')
        + 'slug=' + slug
        + '&dtstart=' + eData.date.replace(/-/g, '') + 'T' + eData.startTime.replace(/:/g, '')
        + '&dtend=' + eData.endDate.replace(/-/g, '') + 'T' + eData.endTime.replace(/:/g, '')
        + '&location=' + encodeURIComponent(eData.placename + ' - ' + eData.address)
        /*+ '&summary=' + encodeURIComponent(eData.title)
        + '&description=' + encodeURIComponent(eData.description  + ' - ' + eData.url)
        + '&categories=' + encodeURIComponent(eData.tags)*/
      );
      
      break;
    
    default: 

      $(this).attr('href', 'http://www.google.com/calendar/event?action=TEMPLATE'
        + '&text=' + encodeURIComponent(eData.title)
        + '&dates=' + eData.date.replace(/-/g,'') + 'T' + eData.startTime.replace(/:/g, '') + '/' + eData.endDate.replace(/-/g,'') + 'T' + eData.endTime.replace(/:/g, '')
        + '&sprop=website:' + eData.url
        + '&details=' + encodeURIComponent(eData.description + ' - ' + eData.url)
        + '&location=' + encodeURIComponent(eData.placename + ' - ' + eData.address));
      
  }
};



/**
 * this bit gets ticked data, bundles it with default data, unticks all other and sends it to callback
 */

var TickedDateTimes = function(callback, options){

  this.init = function(){
    
    $(this.options.checkboxDom).each(function(index, item){
      
      if ($(item).attr('checked')) $(item).attr('checked', false);

    });

  };

  this.onTick = function(cbItem){
    
    cbItem.blur();

    var index = cbItem.index(this.options.checkboxDom);

    // untick others
    $(this.options.checkboxDom).each(function(index2, item) {
      if (index2 != index) $(item).attr('checked', false);
    });

    callback($.extend(this.options.defaultData, {
      startTime: cbItem.parents(this.options.parentDom).find('.js_start_time').html(),
      endTime: cbItem.parents(this.options.parentDom).find('.js_end_time').html(),
      date: cbItem.parents(this.options.parentDom).find('.js_date').html(),
      placename: cbItem.parents(this.options.parentDom).find('.js_placename').html(),
      address: cbItem.parents(this.options.parentDom).find('.js_address').html(),
      locality: cbItem.parents(this.options.parentDom).find('.js_locality').html(),
    }));

  };

  this.options = $.extend({
    checkboxDom: 'input[type="radio"]',
    parentDom: 'li.js_location',
    defaultData: {}
  }, options);

  this.init();

};
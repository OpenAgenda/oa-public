var initMenu = function() {

    init_filter_calendar('.js_date_widget_filter', '.js_calendar_widget');

    init_filter_calendar('.js_date_newsletter_filter', '.js_calendar_newsletter', {my: 'right top', at: 'right bottom'});

    init_widget_handler();
    init_newsletter_handler();

};



var initEmbedCodes = function(options) {

    var embedScriptPath = options.embedScriptPath, resources = options.resources, programUid = options.programUid, embedUid = options.embedUid, lang = options.lang, key = options.key;

    if (!getElementsByClassName(document, 'js_list_code').length) return;

    embedCodeField(getElementsByClassName(document, 'js_list_code')[0], {template: '<script type="text/javascript" src="' + embedScriptPath + '"></sc'+'ript><iframe class="cbpglst" frameborder="0" allowtransparency="allowtransparency" src="' + resources.list + '?key=' + key + '" style="width:100%;"></iframe>'});
    embedCodeField(getElementsByClassName(document, 'js_map_code')[0], {template: '<script type="text/javascript" src="' + embedScriptPath + '"></sc'+'ript><iframe class="cbpgmp" src="' + resources.map + '?key=' + key + '" style="<%= style %>"></iframe>', init: {style: 'width: 100%;'}});
    if (getElementsByClassName(document, 'js_category_code').length) embedCodeField(getElementsByClassName(document, 'js_category_code')[0], {template: '<script type="text/javascript" src="' + embedScriptPath + '"></sc'+'ript><div class="cibulCategories cbpgct" data-cbctl="' + programUid + '/' + embedUid + '|' + key + '"></div>'});
    embedCodeField(getElementsByClassName(document, 'js_calendar_code')[0], {template: '<script type="text/javascript" src="' + embedScriptPath + '"></sc'+'ript><div class="cbpgcl cibulCalendar" data-cbctl="' + programUid + '/' + embedUid + '|' + key + '|' +  lang + '"></div>'});

};



// fetch culture from cookie during integration

var init_filter_calendar = function(fieldDom, canvasDom, options){

  var options = $.extend({
    my: 'right bottom',
    at: 'right top'
  }, (typeof options != 'undefined')?options:{});

  $(fieldDom).each(function(index, item){
    init_single_filter_calendar($(fieldDom).eq(index), $(canvasDom).eq(index), options);
  })
  
};


var init_single_filter_calendar = function(field, calendar_canvas, options) {

  selection_start = false;
  selection_end = false;

  if (field.val()) {

    selection_start = field.val().substr(6,4) + '-' + field.val().substr(3,2) + '-' + field.val().substr(0,2);

    if (field.val().length > 10) {
      selection_end = field.val().substr(13, 10);
      selection_end = selection_end.substr(6,4) + '-' + selection_end.substr(3,2) + '-' + selection_end.substr(0,2);
    } else {
      selection_end = selection_start;
    }
  }

  field.poppit({target: calendar_canvas, my: options.my, at: options.at, onShow: function(){
    
    if (!calendar_canvas.html().length) {
      calendar_canvas.calendar({
        selection_start: selection_start,
        selection_end: selection_end,
        selection_today: false,
        decorated: false,
        week: false,
        locale: 'fr'/*$.getSessionCookie().culture*/,
        onChange: function(formated){
          var date_start = $.fn.formatDate(new Date($.fn.getYear(formated[0]),$.fn.getMonth(formated[0]),$.fn.getDay(formated[0])),'/',false);
          var date_end = $.fn.formatDate(new Date($.fn.getYear(formated[1]),$.fn.getMonth(formated[1]),$.fn.getDay(formated[1])),'/',false);

          if (date_start==date_end) field.val(date_start);
          else field.val(date_start + ' - ' + date_end);

          field.change();

          if (field.val().length!=0) field.siblings('infield').css('display','none');

          field.blur();
        }
      });

      $('.datepickerGoPrev a', calendar_canvas).click(); // big fat tweak to get that range display working
      $('.datepickerGoNext a', calendar_canvas).click(); // same
    }
  
  }});

};


var simpleTab = function(tabDom, paneDom, options) {

  this.init = function(){

    this.tabs = $(tabDom);
    this.panes = $(paneDom);

    this.tabsDom = tabDom;
    this.panesDom = paneDom;

    this.loadState();

    this.eventify();

  };

  this.loadState = function(){

    // loop through tabs, check if input is active or ticked (if radioTab is used) and display corresponding content pane

    var checked = -1;

    this.tabs.each($.proxy(function(index, item){

      if (this.options.radioTabs) {

        if ($('input[type="radio"]', item).attr('checked')) checked = index;

      } else {

        if ($(item).hasClass(this.options.activeClass)) checked = index;
          
      }

      if (checked != -1) return;

    }, this));

    if (checked==-1) checked = this.options.defaultCheckedTab;

    this.display(checked);

  };

  this.eventify = function(){

    var proxy = this;

    $(this.tabs).unbind('click.' + this.options.tabClickEvent).bind('click.' + this.options.tabClickEvent, function(e){

      var index = $(this).index(proxy.tabsDom);

      proxy.display(index);

      if (proxy.options.onClick) proxy.options.onClick(index);

    });

  };

  this.display = function(index){

    if (this.options.radioTabs) {

      $('input[type="radio"]', this.tabsDom).attr('checked', false);

      $('input[type="radio"]', this.tabs.eq(index)).attr('checked', true);
    }

    this.panes.addClass(this.options.displayNoneClass);

    this.panes.eq(index).removeClass(this.options.displayNoneClass);

    if (this.options.onDisplay) this.options.onDisplay(index);

  };

  this.options = $.extend({
    activeClass: 'active',
    radioTabs: false,
    displayNoneClass: 'display-none',
    tabClickEvent: 'tabClick',
    defaultCheckedTab: 0,
    onClick: false,
    onDisplay: false
  }, options);

  this.init();

};



var codeFieldHandler = function(elem, options){

  this.init = function() {

    // stick it to the data of the field or exit

    if (typeof $(elem).data(this.options.objectName) != 'undefined') return false;

    this.elem = $(elem);

    this.elem.data(this.options.objectName, this);

    this.getProgramUrl();

  };

  this.getProgramUrl = function() {

    if (this.options.urlDom == 'a') return $(this.elem.val()).find(this.options.urlDom).attr('href');

    if (this.options.urlDom == 'iframe') {

      return $(this.elem.val()).attr('src');

    }

    return $(this.elem).val();

  };

  this.setProgramUrl = function(newValue) {

    this.elem.val(this.elem.val().replace(this.getProgramUrl(), newValue));

    this.flash(); // ! pom pom!

  };

  this.flash = function(){

    this.elem.css('color', 'gray').delay(200).animate({color:'black'}, 1000);

  };

  this.setParameter = function(name, value) {

    // make sure at this point value is a string
    value = value + '';

    // pick url from string
    var currentProgramUrlValue = this.getProgramUrl();

    if (!currentProgramUrlValue) return;

    // separate link and parameters
    var link = currentProgramUrlValue.replace(/\?.+/, '');

    link = link.replace(/\+/g,'%20'); // this bit replaces + with %20

    var linkParams = decodeURIComponent(currentProgramUrlValue).getUrlParameters();

    if (value.length) { // remove parameter if value is empty

      linkParams[name] = value;  

    } else {

      if (typeof linkParams[name] != 'undefined') delete linkParams[name];

    }

    if (Object.size(linkParams)) {

      var newProgramUrlValue = link + '?' + $.param(linkParams);

    } else {

      var newProgramUrlValue = link;

    }

    // replace old with new

    this.setProgramUrl(newProgramUrlValue);

  };

  this.setLangParameter = function(newLang){

    var langs = ['en','fr','it'];

    for (var i=0;i<langs.length;i++) {
      if (langs[i]==newLang) langs.splice(i,1);
    }

    langs = '(' + langs.join('|') + ')';

    var newProgramUrlValue = this.getProgramUrl();

    if (!newProgramUrlValue) return;

    var rgx = new RegExp("\/" + langs + "\\?", 'g');

    newProgramUrlValue = newProgramUrlValue.replace(rgx, '/' + newLang + '?');

    var rgx = new RegExp("\/" + langs + "\"", 'g');

    newProgramUrlValue = newProgramUrlValue.replace(rgx, '/' + newLang + '"');

    this.setProgramUrl(newProgramUrlValue);

  };

  this.options = $.extend({
    objectName: 'codeFieldHandler',
    urlDom: false
  },options);

  this.init();
};






var inputControl = {
  
  init: function(options, elem) {

    this.options = $.extend({}, $.extend($.extend({}, this.defaults), options));

    this.cleanValues = {};

    this.elem = $(elem);

    if (this.options.clean) this.clean = this.options.clean;
    if (this.options.onCleaned) this.onCleaned = this.options.onCleaned;

    // get error element

    this.errorElem = false;

    if (this.options.errorDom) {

      if (this.options.errorDomRelativePosition == 'prev') this.errorElem = this.elem.prev(this.options.errorDom);

      if (this.options.errorDomRelativePosition == 'next') this.errorElem = this.elem.next(this.options.errorDom);

      if (!this.errorElem.size()) this.errorElem = false;

    }

    if (this.process()) {

      if (this.errorElem) this.errorElem.addClass(this.options.displayNoneClass);

    } else {

      if (this.errorElem) this.errorElem.removeClass(this.options.displayNoneClass);

    }

    this.eventify();

  },

  defaults: {
    clean: false,
    onCleaned: false,
    onValidChange: false,
    errorDom: '.js_error',
    errorDomRelativePosition: 'next',
    displayNoneClass: 'display-none'
  },

  eventify: function(){

    this.elem.change($.proxy(function(){

      if (this.process()) {

        if (this.errorElem) this.errorElem.addClass(this.options.displayNoneClass);

        if (this.options.onValidChange) this.options.onValidChange(this.elem.val());

      } else {

        if (this.errorElem) this.errorElem.removeClass(this.options.displayNoneClass);

      }

    }, this));

  },

  onCleaned: function(){
    
    for (index in this.cleanValues) {
      //console.log(index + ' > ' + this.cleanValues[index]);
    }

  },

  clean: function() {

    switch (this.elem.attr('type')) {
      case 'checkbox':

        var val = this.elem.attr('checked');

        break;

      case 'radio':

        if (!this.elem.attr('checked')) return false;

        var val = this.elem.val();

        break;
      default:

        var val = this.elem.val();

    }

    this.cleanValues[this.elem.attr('name')] = val;

    return true;

  },

  process: function() {

    if (this.clean()) {

      this.onCleaned();

      return true;

    } else {

      return false;

    }

  }
};


(function($){
  $.fn.extend({
    inputControl: function(options, elem){

      if(!this.length) return this;

      return this.each(function(){
        var myControl = Object.create(inputControl);
        myControl.init(options, this);
        $(this).data('inputControl', myControl);
      });
    }
  });

})(jQuery);


var init_newsletter_handler = function(env) {

  var valid = false;

  if (typeof env == 'undefined') env = 'production';

  $('.js_date_newsletter_filter').inputControl({
    errorDomRelativePosition: 'next',
    clean: function(){
      
      var val = this.elem.val();
      valid = false;

      if (!val.length) {

        return false;

      }

      if (val.length==10) {

        this.cleanValues['from'] = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
        this.cleanValues['to'] = '';

        return true;
      }

      if (val.length==23) {

        this.cleanValues['from'] = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
        this.cleanValues['to'] = val.substr(19,4) + '-' + val.substr(16,2) + '-' + val.substr(13,2);

        return true;
      }

      return false;
    }, 
    onCleaned: function(){

      valid = true;

    }
  });

  $('.js_newsletter .js_error').addClass('display-none');

  $('.js_newsletter_submit').click(function(e){
    e.preventDefault();

    var self = this;

    if (!valid) {
      $('.js_newsletter .js_error').removeClass('display-none');      
    } else {

      disable_fields();

      handle_newsletter_request(function(data) {

        if (data.success) {

          if (typeof data.redirect != 'undefined') {
            window.location.href = data.redirect;
            return;
          }

          $('.js_newsletter_html').html(data.partial.replace(/</g,'&lt').replace(/>/g,'&gt'));

          $('.js_newsletter_link a').attr('href', $(self).parents('form').attr('action') + '?edito=' + encodeURIComponent($('.js_newsletter_edito').val()) + '&period=' + encodeURIComponent($('.js_date_newsletter_filter').val()));
          
          $('.js_newsletter_link a').html($('.js_newsletter_link a').attr('href').length>30?$('.js_newsletter_link a').attr('href').substr(0,25) + '...':$('.js_newsletter_link a').attr('href'));
          
          $('.js_newsletter_html').removeAttr('disabled');
          $('.js_newsletter_link, .js_newsletter_html').removeClass('disabled');
          
        } else {

          // clear and disable everything
          disable_fields();

        }

      });

    }

  });

  var disable_fields = function() {
    $('.js_newsletter_link a').attr('href','#');
    $('.js_newsletter_link a').html('');
    $('.js_newsletter_link, .js_newsletter_html').addClass('disabled');
    $('.js_newsletter_html').html('');    
  };

  var handle_newsletter_request = function(callback) {

    if (env=='development') {
      $('.js_newsletter_submit').lock();
      setTimeout(function(){
        $('.js_newsletter_submit').lock(false);
        callback({success: true, partial: 'Trululu'})
      }, 500);
    } else {
      $('.js_newsletter').cSend({onSuccess: callback, lock: $('.js_newsletter_submit') });
    }

  };

};


var init_widget_handler = function(){

  var widgetHandler = new codeFieldHandler('.js_widget_code', {urlDom: 'a'});

  var set_handler_parameter = function(inputCtl) {

    widgetHandler.setParameter(inputCtl.elem.attr('name'), inputCtl.cleanValues[inputCtl.elem.attr('name')]);

  };

  $('.js_widget_order, .js_widget_lang').siblings('label').click(function(){$(this).siblings('input').trigger('click').change(); });

  $('.js_widget_category_select').inputControl({onCleaned: function(){ set_handler_parameter(this); }});
  
  $('.js_widget_location_select').inputControl({onCleaned: function(){ set_handler_parameter(this); }});
  
  $('.js_widget_custom_class').inputControl({onCleaned: function(){ set_handler_parameter(this); }});

  $('.js_widget_order').click(function(e){ $(this).siblings('.js_widget_order').attr('selected',''); }).inputControl({onCleaned: function(){ set_handler_parameter(this); }});
  
  $('.js_widget_no_header').inputControl({onCleaned: function(){ 

    widgetHandler.setParameter('noHeader', this.cleanValues['noHeader']?'1':''); 

  }});

  $('.js_widget_passed').inputControl({onCleaned: function(){

    widgetHandler.setParameter('passed', this.cleanValues['passed']?'0':'');

  }});

  $('.js_widget_lang').click(function(e){ $(this).siblings('.js_widget_lang').attr('selected',''); }).inputControl({
    onCleaned: function(){

      widgetHandler.setLangParameter(this.cleanValues['lang']);

    }
  });



  $('.js_date_widget_filter').inputControl({
    clean: function(){
      
      var val = this.elem.val();

      if (!val.length) {

        this.cleanValues['from'] = '';
        this.cleanValues['to'] = '';

        return true;

      }

      if (val.length==10) {

        this.cleanValues['from'] = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
        this.cleanValues['to'] = '';

        return true;
      }

      if (val.length==23) {

        this.cleanValues['from'] = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
        this.cleanValues['to'] = val.substr(19,4) + '-' + val.substr(16,2) + '-' + val.substr(13,2);

        return true;
      }

      return false;
    }, 
    onCleaned: function(){

      widgetHandler.setParameter('from', this.cleanValues['from']);

      widgetHandler.setParameter('to', this.cleanValues['to']);

    }
  });

  $('.js_widget_event_count').inputControl({

    clean: function() {

      var val = this.elem.val();

      if (!val.length) {

        this.cleanValues[this.elem.attr('name')] = '';

        return true;
      }

      val = parseInt(val, 10);

      if (!isNaN(val)) {

        if (val > 10 || val < 1) return false;

        this.cleanValues[this.elem.attr('name')] = val;

        return true;

      }

      return false;

    },
    onCleaned: function(){

      widgetHandler.setParameter(this.elem.attr('name'), this.cleanValues[this.elem.attr('name')]);

    }
  });

};

var replicate_https_field = function(){
  if (!$('.js_facebook_https_code').size()) return;
  $('.js_facebook_https_code').val($('.js_facebook_code').val().replace('http://', 'https://'));
};

var replicate_select_pick = function(dom, value) {

  $(dom).each(function(index, item) {
    $('option', item).filter(function(){ return $(this).val() == value; }).attr('selected', true);
  });
};
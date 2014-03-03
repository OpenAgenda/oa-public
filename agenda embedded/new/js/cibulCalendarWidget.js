(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulCalendarWidget = cibulWidget({
      name: 'calendar',
      calendar: false,
      existingDates: [],
      selection: false,
      templates: {
        main: '<div class="calendar-canvas"></div>',
      },
      init: function(ctl, config) {

        var lang = config.length>1?config[1]:'en';

        this._create();

        this.createCalendar(lang);

      },

      enable: function(reqParams) {

        // set selection here

        this.selection = false;

        if (!reqParams.from) return;

        this.selection = new Date(reqParams.from);

        if (!reqParams.to) return;

        this.selection = {begin: this.selection, end: new Date(reqParams.to)};

      },
      clear: function() {

        this.existingDates = [];

        if (this.calendar) this.calendar.setSelected(false);

      },
      include: function(eItem) {

        for (var i in eItem.l)
          for (var j = eItem.l[i].d.length - 1; j >= 0; j--)
            if (!contains(this.existingDates, eItem.l[i].d[j])) this.existingDates.push(eItem.l[i].d[j]);

      },
      refresh: function() {

        this.calendar.setSelected(this.selection, false);

        // TWEAK - to force refresh on selection - this should be corrected at the calendar level
        
        if (!this.selection) {

          this.calendar.showNext();
          this.calendar.showPrevious();

        }

        if (this.enabled) {

          this.calendar.enable();

        } else {

          this.calendar.disable();

        }

      },
      createCalendar: function(lang) {

        var self = this;

        this.calendar = new CibulCalendar(el(this.element, 'div'), {
          filter: function(date, classes) {

            return self.filterCalendar(date, classes);
            
          },
          onSelect: function(selection) {

            self._select({
              from: selection.begin.getFullYear() + '-' + (selection.begin.getMonth()<9?'0':'') + (selection.begin.getMonth()+1) + '-' + (selection.begin.getDate()<10?'0':'') + selection.begin.getDate(),
              to: selection.end.getFullYear() + '-' + (selection.end.getMonth()<9?'0':'') + (selection.end.getMonth()+1) + '-' + (selection.end.getDate()<10?'0':'') + selection.end.getDate()
            });

          },
          navDomContent: { prev: '<', next: '>'},
          lang: lang
        });

      },
      filterCalendar: function(date, classes) {

        var formattedDate = date.getFullYear() + '-' + (date.getMonth()<9?'0':'') + (date.getMonth()+1) + '-' + (date.getDate()<10?'0':'') + date.getDate();

        if (contains(this.existingDates, formattedDate)) classes.push('hasdates');

        return classes;

      }
    });

    new cibulCalendarWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgcl', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();
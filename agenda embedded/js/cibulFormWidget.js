(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};
  
  var onLoad = function(element, register) {


    var cibulFormWidget = cibulWidget({
      name: 'form',
      lang: 'en',
      requireCtl: false,
      standalone: true,
      scrollOffset: 100,
      resources: {
        form: '//cibul.net/embed/{uid}/form'
      },
      labels: {
        fr: {
          add: 'ajoutez un événement',
          cancel: 'retour à la liste'
        },
        en: {
          add: 'add an event',
          cancel: 'back to list',
        },
      },
      classes: {
        form: 'cibulFrame'
      },
      selectors: {
        listFrame: '.cbpglst'
      },
      templates: {
        main: '<button><%= labels.add %></button>'
      },

      init: function(config) {

        this.uid = config[0];

        this.lang = config[1];

        this.key = config[2];

        if (els(this.selectors.listFrame).length) {

          this.initIntegrated(config);

        } else {

          this.initStandalone(config);

        }

      },


      /**
       * standalone form is in its own page,
       * and is displayed as soon as the page loads
       * no add button is required
       */
      
      initStandalone: function(config) {

        this._log('initing standalone mode');

        this.initFrame();

        element.appendChild(this.frameElem);

      },


      /**
       * integrated mode displays a button 'add an event'
       * when pressed, the form replaces the event list and calls
       * for controller to disable all widgets until procedure is through
       */
      
      initIntegrated: function(config) {

        var self = this;

        this._log('initing integrated mode');

        this._create({labels: this.labels[this.lang]});

        extend(this, {
          standalone: false,
          listFrame: el(this.selectors.listFrame),
          buttonElem: el(element, 'button'),
          running: false
        });

        addEvent(this.buttonElem, 'click', function(e) {

          if (!self.enabled) return;

          if (!self.running) {

            self.swapFrameTo();

            self.buttonElem.innerHTML = self.labels[self.lang].cancel;

          } else {

            self.swapFrameBack();

          }

        });

      },


      /**
       * use the existing frame to display the form
       */
      
      swapFrameTo: function() {

        var self = this;

        this.controller.requestModal(this.name, function() {

          self.initFrame();

          self.listFrame.insertAdjacentElement('beforebegin', self.frameElem);
          
          self.listFrame.parentNode.removeChild(self.listFrame);

          self.running = true;

        });

      },

      /**
       * remove the form frame until it is needed again
       */

      swapFrameBack: function() {

        var self = this;

        self.frameElem.insertAdjacentElement('beforebegin', self.listFrame);

        self.frameElem.parentNode.removeChild(self.frameElem);

        self.frameElem = undefined;

        this.controller.releaseModal();

        self.running = false;

        self.buttonElem.innerHTML = self.labels[self.lang].add;

      },

      initFrame: function() {

        var self = this;

        this.frameElem = document.createElement('iframe');

        this.frameElem.className = this.classes.form;

        this.frameElem.setAttribute('frameborder', 0);
        this.frameElem.setAttribute('allowtransparency', 'allowtransparency');

        this.frameElem.src = (typeof cibulEnv !== 'undefined'?cibulEnv.paths.form:self.resources.form).replace('{uid}', this.uid) + '?key=' + this.key;

        addEvent(this.frameElem, 'load', function() {

          iTunnel({target: self.frameElem, onReceive: function(data){

            if (data.height) self.frameElem.style.height = data.height + 'px';

            if (data.complete && !self.standalone) {
              
              self.swapFrameBack();

            } else if (data.next) {

              // unused

            } else if (data.clear) {

              // form content has changed and needs to be set to top

              var iframePos = self.findPos(self.frameElem)[1];

              if (self.scrollPosition() > iframePos) self.scrollPosition(iframePos - self.scrollOffset);

            }

          }});

        });

      },

      scrollPosition: function(value) {

        if (typeof value !== 'undefined') scrollTo(0, value);

        return getScrollOffsets().y;

      },

      findPos: function(element) {

        var curleft = 0, curtop = 0;

        if (element.offsetParent) {

          do {
            curleft += element.offsetLeft;
            curtop += element.offsetTop;
          } while (element = element.offsetParent);

        }

        return [curleft, curtop];

      }

    });

    new cibulFormWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgbtn', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();
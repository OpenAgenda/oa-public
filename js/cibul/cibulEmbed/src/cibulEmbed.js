if (!window.cibulEmbedWidget) window.cibulEmbedWidget = (function(){

  var params = {
    controllers: [
      { className: 'cbpglst', name: 'list'},
      { className: 'cbevdtl', name: 'event'},
      { className: 'cbpgmp', name: 'map'},
      { className: 'cbpgct', name: 'categories'},
      { className: 'cbpgtg', name: 'tags' },
      { className: 'cbpgcl', name: 'calendar'},
      { className: 'cbpgae', name: 'addButton'}
    ],
    controlResource: 'https://openagenda.com/embed/{uid}/controldata',
    filterName: 'filter'
  },

  hasFrame,

  scrollOffset = 150,

  VIEWS = { LIST: 0, FORM: 1},

  _run = function() {

    hasFrame = els('.cbpglst').length?true:false;

    _addStyle();

    forEach(params.controllers, function(controller) {

      forEach(els('.' + controller.className), function(elem) {
        _controllers[controller.name](elem);
      });

    });

    _monitorHash();

    _readHash();

  },

  _controllers = {
    list: function(iframeElem) {

      if (_flagged(iframeElem)) return;

      var tunnel,
      eh = sEventHandler.getInstance(),
      responsePending = false,
      hasNext = true,
      monitorScroll = true,
      programScrollPos = false,
      iframePos = false,
      currentView = null,
      views = {},
      _init = function() {

        // request to get current view name
        eh.on('getview', function(callback) {

          callback(currentView);

        });

        if (iframeElem===null) return;

        currentView = VIEWS.LIST;

        views[VIEWS.LIST] = { url: iframeElem.src };

        tunnel = iTunnel({target: iframeElem, onReceive: function(data){

          if (typeof data.view !== 'undefined') {
            
            currentView = data.view; // the view switched itself. tell anyone that cares.
            eh.trigger('setview', currentView);

          }

          if (data.height) _adjustHeight(data.height);

          if (currentView==VIEWS.LIST) {

            _processListData(data);

          } else {

            _processFormData(data);

          }

        }});

        iframeElem.style.border = 'none';

        // if no width is specified in inline style, set 100%.
        if (!iframeElem.style.width.length) iframeElem.style.width = '100%';

        addEvent(document, 'scroll', _monitorScroll);

        eh.on('load', function(data){

          tunnel.send(extend(data, { event: 'load' }));

        });

        eh.on('hasNext', function(data) {

          if (typeof data.hasNext == 'string') data.hasNext = data.hasNext=='true'?true:false;

          hasNext = data.hasNext;

        });

        // request to set view params
        eh.on('setviewparams', function(params) {
          views[params.name] = { url: params.url };
        });

        // request to set view
        eh.on('setview', function(name) {

          iframeElem.src = views[name].url; // loading new frame content
          currentView = name;

        });

      },

      _processListData = function(data) {

        responsePending = false;

        if (data.event) eh.trigger(data.event, data);
        
        if (data.eventDisplay || data.reset == 'true') {

          if (data.eventDisplay=='true' || data.reset == 'true') {

            // adjust top of the scroll to have the iframe visible

            monitorScroll = false;

            // we want to change the scroll only when it is below the top of the iframe.

            programScrollPos = _scrollPosition();

            iframePos = _findPos(iframeElem)[1];

            _reposition(programScrollPos);

          } else {

            // scroll to tracked position in list

            monitorScroll = true;

            _scrollPosition(programScrollPos);

          }

        }
      },
      _processFormData = function(data) {

        if (data.next) {

          iframePos = _findPos(iframeElem)[1];
          
          _reposition();

          iframeElem.src = data.next;

        }

      },
      _monitorScroll = function() {

        if (monitorScroll && hasNext && (iframeElem.offsetTop + iframeElem.offsetHeight <= _scrollPosition() + el('html').clientHeight)) {
          
          if (!responsePending) {
            responsePending = true;
            tunnel.send({event: 'loadNext'});
          }

        }

      },

      _adjustHeight = function(height) {
        
        iframeElem.style.height = height + 'px';

      },

      _reposition = function(refPos) {

        if (typeof refPos == 'undefined') {
          refPos = _scrollPosition();
        }

        if (refPos > iframePos) _scrollPosition(iframePos - scrollOffset);

      };

      _init();
    },

    event: function(iframeElem) {

      if(_flagged(iframeElem)) return;

      var tunnel = iTunnel({target: iframeElem}),
      
      eh = sEventHandler.getInstance();

      tunnel.setOnReceive(function(data) {

        if (data.height) iframeElem.style.height = data.height + 'px';

      });
    },

    map: function(iframeElem) {

      if(_flagged(iframeElem)) return;

      iframeElem.style.borderStyle = 'none';

      var tunnel = iTunnel({target: iframeElem, onReceive: function(data) {

        eh.trigger('load', data);

      }}),
      
      eh = sEventHandler.getInstance();

      eh.on('success', function(data) {

        tunnel.send(data);

      });

      eh.on('eventopensuccess', function(data) {
        tunnel.send(data);
      });

      eh.on('closeevent', function(data) {
        tunnel.send(data);
      });

    },

    categories: function(categoriesElem, onReady) {

      if(_flagged(categoriesElem)) return;

      if (!categoriesElem.getAttribute('data-cbctl')) {
        console.log('categories config not found');
        return;
      }

      var eh = sEventHandler.getInstance(),
      
      ctlData = categoriesElem.getAttribute('data-cbctl').split('|'),
      
      uid = ctlData[0],
      
      key = ctlData[1],
      
      ctl = cibulControlData.getInstance(key, ctlData.length==3?ctlData[2]:params.controlResource);

      ctl.get(uid, function(controlData) {

        if (!controlData.ct.length) return;

        handleCategories({
          canvas: categoriesElem,
          categories: controlData.ct,
          triggerEvents: { loading: 'lhLoading', loadSuccess: 'success', loadFail: 'lhFail'},
          triggeredEvents: { newSelect: 'load' }
        });

        if (onReady !== undefined) onReady();

      });

    },

    tags: function(tagsElem, onReady) {

      if (_flagged(tagsElem)) return;

      if (!tagsElem.getAttribute('data-cbctl')) return console.log('tags config not found');

      var eh = sEventHandler.getInstance(),

      UID = 0, KEY = 1, TAGS = 2, RES = 3, // the indexes of config values

      ctlData = tagsElem.getAttribute('data-cbctl').split('|');

      var tagSlugs = ctlData.length==2?[]:ctlData[TAGS].split(',');

      if (tagSlugs.length && !tagSlugs[0].length) tagSlugs.pop(); // tweak. really. for when debug tags are not set

      if (ctlData.length < 2) return console.log('tags config is incomplete: ' + tagsElem.getAttribute('data-cbctl'));

      ctl = cibulControlData.getInstance(ctlData[KEY], ctlData.length==4?ctlData[RES]:params.controlResource);

      ctl.get(ctlData[UID], function(controlData) {

        // list of used tags could be provided here

        if (!controlData.t || !controlData.t.length) return console.log('there are no tags in this agenda');

        var handler = handleTags({
          usedSlugs: tagSlugs.length?tagSlugs:false,
          tags: controlData.t,
          events: { newSelect: 'load', loading: 'lhLoading', loadSuccess: 'success', loadFail: 'lhFail' },
          canvas: tagsElem,
        });

        if (typeof onReady !== 'undefined') onReady(handler);

      });

    },

    calendar: function(calendarElem) {

      if(_flagged(calendarElem)) return;

      if (!calendarElem.getAttribute('data-cbctl')) {
        console.log('calendar config not found');
        return;
      }

      var eh = sEventHandler.getInstance(),
        ctlData = calendarElem.getAttribute('data-cbctl').split('|'),
        uid = ctlData[0],
        key = ctlData[1],
        lang = ctlData[2],
        ctl = cibulControlData.getInstance(key, ctlData.length==4?ctlData[3]:params.controlResource);


        ctl.get(uid, function(controlData) {

          handleProgramControlData([extractDate], function(controlData, processedData) {

            calendarElem.innerHTML = '</div><div class="calendar-canvas"></div>';

            createDateSelect(calendarElem, processedData[0], eh, {
              triggerEvents: { disable: 'lhLoading', refresh: 'success', enable: 'lhFail' },
              triggeredEvents: { dateSelect: 'load' },
              lang: lang,
              nav: { prev: '<', next: '>'}
            });

          }, controlData);

        });

    },

    addButton: function(buttonElem) {

      if (buttonElem===null) return;

      if(_flagged(buttonElem)) return;

      if (!buttonElem.getAttribute('data-cbctl')) {
        console.log('button config not found');
        return;
      }

      var eh = sEventHandler.getInstance(),
      ctlData = buttonElem.getAttribute('data-cbctl').split('|'),
      uid = ctlData[0], key = ctlData[1], formUrl = ctlData[2], height = ctlData.length>4?ctlData[4]:2300, width = ctlData.length>5?ctlData[5]:500,
      currentView = null, labels = {},
      enabled = false,

      init = function() {

        labels[VIEWS.LIST] = buttonElem.innerHTML;
        labels[VIEWS.FORM] = ctlData[3];

        if (!hasFrame) {

          _displayFrame();

          return;

        }

        // the list controller is the beholder of urls. give it the form url
        eh.trigger('setviewparams', { name: VIEWS.FORM, url: formUrl + '?key=' + key });

        eh.trigger('getview', function(view) {

          _applyButtonBehavior();

          _enable();
            
          currentView = view;
          
        });

        eh.on('setview', function(name) {

          currentView = name;

          _enable();

        });

      },

      _applyButtonBehavior = function() {

        addEvent(buttonElem, 'click', function(e) {

          preventDefault(e);

          if (!enabled) return;

          eh.trigger('setview', currentView = currentView==VIEWS.LIST?VIEWS.FORM:VIEWS.LIST);

          _disable();

          // pretty loose, but should be enough for now

          setTimeout(function() { _enable(); }, 1000);

        });

      },

      _displayFrame = function() {

        buttonElem.style.display = 'none';

        var iframe = document.createElement('iframe');

        iframe.src= formUrl + '?key=' + key + '&standalone=';
        iframe.style.height = height + 'px';
        iframe.style.width = width + 'px';

        buttonElem.insertAdjacentElement('afterend', iframe);

        var tunnel = iTunnel({target: iframe, onReceive: function(data){

          if (data.next) {
            
            iframe.src = data.next;

            var iframePos = _findPos(iframe)[1];

            if (_scrollPosition() > iframePos) _scrollPosition(iframePos - scrollOffset);

          }

          if (data.height) iframe.style.height = data.height + 'px';

        }});

      },

      _enable = function() {

        if (currentView !== null) buttonElem.innerHTML = labels[currentView];

        enabled = true;

      },

      _disable = function() {

        enabled = false;

      };

      init();

    }

  },

  _monitorHash = function() {

    addEvent(window, 'hashchange', _readHash);

  },

  _readHash = function() {

    var filter = hash.getParam('filter');

    if (filter && filter.length==10) {
      if (new Date(filter) !== 'Invalid Date') sEventHandler.getInstance().trigger('load', { from: filter });
    }

  },

  _findPos = function(element) {

    var curleft = 0, curtop = 0;

    if (element.offsetParent) {

      do {
        curleft += element.offsetLeft;
        curtop += element.offsetTop;
      } while (element = element.offsetParent);

    }

    return [curleft, curtop];

  },

  _scrollPosition = function(value) {

    if (typeof value !== 'undefined') scrollTo(0, value);

    return getScrollOffsets().y;
    
  },

  _addStyle = function() {

    var style = [

      '.cbFrame { border: none; padding: 0; margin: 0; overflow: hidden; }',

      '.ccal { width: 18em; font-size: 0.8em; text-align: center; font-family: "Arial",Tahoma,Helvetica,Sans-Serif; display: inline-block; }',
      '.ccal div { display: block;}',
      '.ccal ul { margin: 0; padding: 0; text-align: left; }',
      '.ccal li { list-style-type: none; display: inline-block; width: 13.2%; cursor: pointer; text-align: center; border: 1px solid transparent; }',
      '.ccal li span { display: inline-block; line-height: 1.8em; }',
      '.ccal li.calmonth { width: 69%; cursor: pointer; }',
      '.ccal li span { padding: 0.1em 0.05em; display: block; }',
      '.ccal li.calprev span, .ccal li.calnext span { background: #eee; color: #aaa; }',
      '.ccal li.calprev, .ccal li.calnext { border: 1px solid #eee; }',
      '.ccal .calbody li { cursor: pointer; }',
      '.ccal .calbody li span { color: #999; }',
      '.ccal .calbody li.today { border: 1px solid #eee; }',
      '.ccal .calbody li.selected span { background: #666; color: white; }',
      '.ccal .calbody li.preselected span { background: #f0f0f0; }',
      '.ccal * { -moz-user-select: -moz-none; -khtml-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; }',
      '.ccal .calbody li.hasdates span { color: #333; }',


      '.cibulCategories { font: 13px/1.5 "Helvetica Neue",Arial,Helvetica, "Liberation Sans",FreeSans,sans-serif; max-width: 300px; display: inline-block; }',
      '.cibulCategories li { cursor: pointer; }',

      '.cibulCategories .filter-item { padding: 0 5px 0 10px; display: inline-block; border: 1px solid transparent; line-height: 2em; vertical-align: middle; }',
      '.cibulCategories .filter-item span { display: none; font-size: 0.8em; margin-left: 5px; font-weight: bold; }',
      '.cibulCategories .filter-item i { visibility: hidden; }',

      '.cibulCategories .filter-item.active { border: 1px solid #ddd;}',
      '.cibulCategories .filter-item.active span { display: inline-block; }',
      '.cibulCategories .filter-item.active i { visibility: visible; padding-left: 0.5em; }',

      '.cibulTags { font: 13px/1.5 "Helvetica Neue",Arial,Helvetica, "Liberation Sans",FreeSans,sans-serif; max-width: 300px; display: inline-block; }',

      '.cibulTags li { display: inline-block; padding: 0.1em 0.4em; margin: 0 0.5em 0.5em 0; }',

      '.cibulTags li a { text-decoration: none; color: #666; }',

      '.cibulTags li a:hover { text-decoration: underline; }',

      '.cibulTags .active { border: 1px solid #ddd; }'

    ].join(' '),

    sheet = document.createElement('style');

    sheet.type = 'text/css';

    sheet.media = 'all';

    if (sheet.styleSheet) {
      sheet.styleSheet.cssText = style;
    } else {
      sheet.innerHTML = style;
    }

    document.body.appendChild(sheet);

  },

  _flagged = function(elem) {

    if (elem.cibulFlagged) return true;

    elem.cibulFlagged = true;

    return false;

  };

  /* common */ if(typeof Object.size=='undefined')Object.size=function(a){var b=0,key;for(key in a){if(a.hasOwnProperty(key))b++}return b};function extend(){for(var i=1;i<arguments.length;i++)for(var a in arguments[i])if(arguments[i].hasOwnProperty(a))arguments[0][a]=arguments[i][a];return arguments[0]}function isDef(a){return typeof a!=='undefined'}function contains(a,b){var i=a.length;while(i--){if(a[i]===b){return true}}return false}function isArray(a){return Object.prototype.toString.call(a)==='[object Array]'}var unpack=function(a){return JSON.parse(a)};var hasClass=function(a,b){return(' '+a.className+' ').indexOf(' '+b+' ')>-1};var addClass=function(a,b){if(!hasClass(a,b))a.className=a.className+' '+b};var removeClass=function(a,b){if(hasClass(a,b)){var c=new RegExp(b,'g');a.className=a.className.replace(c,'')}};var removeEvent=function(b,c,d){if(b===null||b===undefined)return;if(typeof c=='string')c=[c];forEach(c,function(a){if(b.removeEventListener){b.removeEventListener(a,d,false)}else if(b.detachEvent){b.detachEvent('on'+a,d)}else{b["on"+a]=null}})};var addEvent=function(b,c,d){if(b==null||b==undefined)return;if(typeof c=='string')c=[c];forEach(c,function(a){if(b.addEventListener){b.addEventListener(a,d,false)}else if(b.attachEvent){b.attachEvent("on"+a,d)}else{b["on"+a]=d}})};var preventDefault=function(a){a.preventDefault?a.preventDefault():a.returnValue=false};function getElementsByClassName(b,c){if(typeof b=='string'){c=b;b=document};var a=[];var d=new RegExp('(^| )'+c+'( |$)');var e=b.getElementsByTagName("*");for(var i=0,j=e.length;i<j;i++)if(d.test(e[i].className))a.push(e[i]);return a};var els=function(a,b){if(typeof a=='string'){b=a;a=document}var c=b.substr(0,1);if('.#,'.indexOf(c)!==-1)b=b.substr(1);if(c=='.')return getElementsByClassName(a,b);else if(c=='#'){var d=a.getElementById(b);if(d)return[d];else return[]}else return a.getElementsByTagName(b)};var el=function(a,b){var c=els(a,b);return c.length?c[0]:null};var previousObject=function(a){a=a.previousSibling;while(a&&a.nodeType!=1)a=a.previousSibling;return a};var nextObject=function(a){a=a.nextSibling;while(a&&a.nodeType!=1)a=a.nextSibling;return a};var childObject=function(a,b){var i=0,realI=0;while(a.childNodes[i]){if(a.childNodes[i].nodeType==1){if(realI==b)return a.childNodes[i];realI++}i++}return false};var getChildIndex=function(a){var i=0;while((a=previousObject(a))!==null)i++;return i};function forEach(a,b){for(var i=0;i<a.length;i++)b(a[i])}function asymDiff(a,b){if(typeof dSuffix!='string')dSuffix='';var c={};for(var d in a){if(typeof b[d]!='undefined'){if(b[d]!==a[d])c[d]=a[d]}else{c[d]=a[d]}}return c}if(typeof HTMLElement!="undefined"&&!HTMLElement.prototype.insertAdjacentElement){HTMLElement.prototype.insertAdjacentElement=function(a,b){switch(a.toLowerCase()){case'beforebegin':this.parentNode.insertBefore(b,this);break;case'afterbegin':this.insertBefore(b,this.firstChild);break;case'beforeend':this.appendChild(b);break;case'afterend':if(this.nextSibling)this.parentNode.insertBefore(b,this.nextSibling);else this.parentNode.appendChild(b);break}};HTMLElement.prototype.insertAdjacentHTML=function(a,b){var r=this.ownerDocument.createRange();r.setStartBefore(this);var c=r.createContextualFragment(b);this.insertAdjacentElement(a,c)};HTMLElement.prototype.insertAdjacentText=function(a,b){var c=document.createTextNode(b);this.insertAdjacentElement(a,c)}}function getScrollOffsets(w){w=w||window;if(typeof w.pageXOffset!=='undefined')return{x:w.pageXOffset,y:w.pageYOffset};var d=w.document;if(document.compatMode=="CSS1Compat"){return{x:d.documentElement.scrollLeft,y:d.documentElement.scrollTop}}return{x:d.body.scrollLeft,y:d.body.scrollTop}}function windowInnerHeight(){return window.innerHeight||document.documentElement.clientHeight||document.getElementsByTagName('body')[0].clientHeight}function triggerEvent(a,b){var e;if(document.createEvent){e=document.createEvent("HTMLEvents");e.initEvent(b,true,true)}else{e=document.createEventObject();e.eventType=b}e.eventName=b;if(document.createEvent){a.dispatchEvent(e)}else{a.fireEvent("on"+e.eventType,e)}}function isElement(o){return(typeof HTMLElement==="object"?o instanceof HTMLElement:o&&typeof o==="object"&&o!==null&&o.nodeType===1&&typeof o.nodeName==="string")}if(typeof String.prototype.trim!=='function'){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,'')}}function removeProperty(a,b){if(typeof a.removeProperty!=='undefined')return a.removeProperty(b);return a.removeAttribute(b)}
  /* makeUnselectable v0.1 */ function makeUnselectable(a){if(a.nodeType==1){a.setAttribute("unselectable","on")}var b=a.firstChild;while(b){makeUnselectable(b);b=b.nextSibling}};
  /* urlStrings */ if(typeof String.prototype.getUrlParameters=='undefined')String.prototype.getUrlParameters=function(){var c={};var d=this.replace(/[?#&]+([^=&]+)=([^&#]*)/gi,function(m,a,b){c[a]=decodeURIComponent(b)});return c};if(typeof String.prototype.addUrlParameters=='undefined')String.prototype.addUrlParameters=function(a){var b=extend(this.getUrlParameters(),a);var c='';for(index in b){c=c.addUrlParameter(index,b[index])}if(this.indexOf('?')!=-1)return this.substr(0,this.indexOf('?'))+'?'+c.substr(1);return this+'?'+c.substr(1)};if(typeof String.prototype.addUrlParameter=='undefined')String.prototype.addUrlParameter=function(a,b){if(typeof b=='undefined')b='';var c=a+'='+encodeURIComponent(b);var d=this;if(d.indexOf('?')!=-1)d=d+'&'+c;else d=d+'?'+c;return d};
  /* Base64 v0.1*/ var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;a=Base64._utf8_encode(a);while(i<a.length){c=a.charCodeAt(i++);chr2=a.charCodeAt(i++);chr3=a.charCodeAt(i++);enc1=c>>2;enc2=((c&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64}else if(isNaN(chr3)){enc4=64}b=b+Base64._keyStr.charAt(enc1)+Base64._keyStr.charAt(enc2)+Base64._keyStr.charAt(enc3)+Base64._keyStr.charAt(enc4)}return b},decode:function(a){var b="";var c,chr2,chr3;var d,enc2,enc3,enc4;var i=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<a.length){d=Base64._keyStr.indexOf(a.charAt(i++));enc2=Base64._keyStr.indexOf(a.charAt(i++));enc3=Base64._keyStr.indexOf(a.charAt(i++));enc4=Base64._keyStr.indexOf(a.charAt(i++));c=(d<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;b=b+String.fromCharCode(c);if(enc3!=64){b=b+String.fromCharCode(chr2)}if(enc4!=64){b=b+String.fromCharCode(chr3)}}b=Base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var n=0;n<a.length;n++){var c=a.charCodeAt(n);if(c<128){b+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){b+=String.fromCharCode((c>>6)|192);b+=String.fromCharCode((c&63)|128)}else{b+=String.fromCharCode((c>>12)|224);b+=String.fromCharCode(((c>>6)&63)|128);b+=String.fromCharCode((c&63)|128)}}return b},_utf8_decode:function(a){var b="";var i=0;var c=c1=c2=0;while(i<a.length){c=a.charCodeAt(i);if(c<128){b+=String.fromCharCode(c);i++}else if((c>191)&&(c<224)){c2=a.charCodeAt(i+1);b+=String.fromCharCode(((c&31)<<6)|(c2&63));i+=2}else{c2=a.charCodeAt(i+1);c3=a.charCodeAt(i+2);b+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));i+=3}}return b}};
  /* loadJs v0.1 */ var loadJs=function(a,b){if(typeof a=='string'){var s=document.createElement('script');document.getElementsByTagName('head')[0].appendChild(s);s.onload=function(){if(typeof b=="function")b();b=null};s.onreadystatechange=function(){if(s.readyState==4||s.readyState=="complete"){if(typeof b=="function")b();b=null}};s.charset="utf-8";s.src=a}else{var c=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){c++;if(c==a.length){b();b=null}})}}};
  /* hash v0.1 */ var hash={getParam:function(a,b){var c=document.location.hash.getUrlParameters();return(typeof c[a]!='undefined')?c[a]:b},setParam:function(a,b){var c=document.location.hash.getUrlParameters();c[a]=b;document.location.hash=''.addUrlParameters(c)},getBase64Param:function(a,b){var c=this.getParam(a,false);return c?Base64.decode(c).getUrlParameters():b},setBase64Param:function(a,b){this.setParam(a,Base64.encode(''.addUrlParameters(b)))},};
  /* setLinks, setLinksElems v0.1 */ function setLinks(c,d){var e=typeof d.targetBlank=='undefined'?'':d.targetBlank?' target="_blank"':'',classes=typeof d.linkClasses=='undefined'?'':[' class="',d.linkClasses,'"'].join(''),patterns={http:/(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,www:/(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,mailto:/([\.\w]+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim};return c.replace(/\u200B/g,"").replace(patterns.http,function(a,b){return b?a:['<a',classes,'" href="',a,'"',e,'>',a,'</a>'].join('')}).replace(patterns.www,function(a,b){return b?a:['<a',classes,'" href="http://',a,'"',e,'>',a,'</a>'].join('')}).replace(patterns.mailto,['<a',classes,'" href="mailto:$1">$1</a>'].join(''))};function setLinksElems(b,c){if(typeof b.nodeType!='undefined')b=[selem];forEach(b,function(a){a.innerHTML=setLinks(a.innerHTML,c)})};
  /* remote v0.2 */ var remote={get:function(a,b,c,d){if(d==undefined)d=false;if(d){this.getXmlHttp(a,b,c)}else{this.getJsonp(a,b,c)}},getXmlHttp:function(d,e,f){var g=this;if(typeof e=='function'){f=e;e={}}var h=0;if(e.retries)h=e.retries;if(!e.timeout)e.timeout=2000;if(!e.name)e.name=d;var i=false;if(e.logger)e.logger.log('remote.getXmlHttp - preparing get for item '+e.name);var j=this.appendToUrl(d,e.data);var k=function(a){if(i)return;i=true;if(e.logger)e.logger.log('remote.getXmlHttp - response received for item '+e.name);f('success',a)};var l=function(){if(i)return;if(h){if(e.logger)e.logger.log('remote.getXmlHttp - timeout hit, retrying for item '+e.name);m();h--}else{i=true;if(e.logger)e.logger.log('remote.getXmlHttp - timeout hit, no retry for item '+e.name);f('timeout')}};var m=function(){var b=setTimeout(function(){l()},e.timeout);var c=new XMLHttpRequest();c.onreadystatechange=function(){if(c.readyState==4)if(c.status==200){clearTimeout(b);if(c.responseText.substring(0,1)=='('){var a=c.responseText.substring(1).substring(0,c.responseText.length-2)}else{var a=c.responseText}k(JSON.parse(a))}};c.open("GET",j,true);c.setRequestHeader("X-Requested-With","XMLHttpRequest");c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.send()};m(k,l)},getJsonp:function(c,d,e){var f,timeout=d.timeout?d.timeout:2000,retries=d.retries?d.retries:0,sentUrl=this.appendToUrl(c,d.data),callbackParam={},self=this,callbackParamName=d.callbackParamName?d.callbackParamName:'callback';var g=function(a){clearTimeout(f);e('success',a)};var h=function(){if((!window[d.data.callback])||!retries)return e('timeout');i();retries--};var i=function(){var a='jsonpCb'+Math.ceil(Math.random()*100000);window[a]=g;var b=document.createElement('script');if(sentUrl.indexOf(callbackParamName+'=')!=-1){b.src=sentUrl.substring(0,sentUrl.indexOf(callbackParamName+'=')+9)+a+sentUrl.substring(sentUrl.indexOf(callbackParamName+'=')+9)}else{callbackParam[callbackParamName]=a;b.src=self.appendToUrl(sentUrl,callbackParam)}document.getElementsByTagName('head')[0].appendChild(b)};i()},getStack:function(a){var b=this;var c={};var d=false;for(index in a.stack){if(a.logger)a.logger.log('remote.getStack - sending index '+index);b.send(a.stack,index,c,a.callback,a.logger,a.retries,a.timeout,a.ajax)}},send:function(c,d,e,f,g,h,i,j){var k=this;if(typeof j=='undefined')j=true;k.responseType='success';k.get(c[d].resource,{data:c[d].parameters,retries:h,logger:g,name:d,timeout:i},function(a,b){delete c[d];if(a=='success'){if(g)g.log('remote.send - received index '+d+' successfully');e[d]=b}else{k.responseType='partial'}if(!Object.size(c)){if(!Object.size(e))k.responseType='noconnection';f(k.responseType,e)}},j)},appendToUrl:function(a,b){if(typeof b!='undefined'){if(a.indexOf('?')==-1){a=a+'?'}else{a=a+'&'}for(name in b){if(typeof b[name]=='object'){for(index in b[name]){a=a+name+'[]='+encodeURIComponent(b[name][index])+'&'}}else{a=a+name+'='+encodeURIComponent(b[name])+'&'}};if(a.substr(a.length-1,1)=='&')a=a.substr(0,a.length-1)}return a}};
  /* iTunnel v0.2 */ (function(){var f={ADDRESSED:'a',OTHER:'o',BROADCAST:'b'},hashCache,iTunnel=function(c){var d=false,id,isParent=false,handshaken=false,c=extend({target:false,onReady:false,onReceive:false,idName:'id',hashName:'t',hashCache:'v',forceFallback:false,tunnelNextIdName:'iTunnelNextId'},c),_init=function(){if(c.target)isParent=true;if(isParent)id=(window[c.tunnelNextIdName]==undefined)?(window[c.tunnelNextIdName]=1)-1:window[c.tunnelNextIdName]++;if(!window['postMessage']||c.forceFallback){d=true;_monitorHash(c.hashName,c.hashCache,_onReceive,c.target)}else{_monitorMessage(_onReceive)}send()},send=function(a){if(typeof a=='undefined')a={};if(typeof id!='undefined')a[c.idName]=id;if(d){var b=_writeHash(isParent?c.target.src:document.referrer,c.hashName,c.hashCache,a);if(isParent)c.target.src=b;else parent.location.href=b}else{_postMessage(isParent?c.target.contentWindow:parent,isParent?c.target.src:document.referrer,a)}},setOnReceive=function(a){c.onReceive=a},_onReceive=function(a){if(isParent)switch(_messageType(c.idName,id,a)){case f.BROADCAST:send();case f.OTHER:return;case f.ADDRESSED:if(!handshaken){handshaken=true;if(c.onReady)c.onReady()}}else{if(typeof a[c.idName]!='undefined'&&(!handshaken)){handshaken=true;id=a[c.idName];send();if(c.onReady)c.onReady()}}if(typeof a[c.idName]!='undefined')delete a[c.idName];if(c.onReceive&&Object.size(a))c.onReceive(a)};_init();return{send:send,setOnReceive:setOnReceive}},_messageType=function(a,b,c){if(typeof c[a]=='undefined')return f.BROADCAST;else if(c[a]==b)return f.ADDRESSED;else return f.OTHER},_postMessage=function(a,b,c){var d=Base64.encode(''.addUrlParameters(c));a['postMessage'](d,b.replace(/#.*$/,''))},_monitorMessage=function(c){addEvent(window,'message',function(a){var b=Base64.decode(a.data).getUrlParameters();c(b)})},_monitorHash=function(b,c,d,e){if(!hashCache)hashCache=Math.ceil(Math.random(0,100000)*1000);addEvent(window,'hashchange',function(){var a=Base64.decode(hash.getParam(b,'',document.location.href.substr(document.location.href.replace(/#.*$/,'').length))).getUrlParameters();if(typeof a[c]!='undefined')delete a[c];d(a)})},_writeHash=function(a,b,c,d){d[c]=hashCache++;var e=Base64.encode(''.addUrlParameters(d)),targetUrl=a.replace(/#.*$/,''),targetHash=a.substr(targetUrl.length).replace('#','');return targetUrl+'#'+hash.setParam(b,e,targetHash)};window.iTunnel=iTunnel})();
  /* EventHandler v0.2 */ (function(){var c=function(){this.register={};this.nextId=1};c.prototype={on:function(a,b){if(typeof this.register[a]=='undefined')this.register[a]=[];this.register[a].push({func:b,funcId:this.nextId});return this.nextId++},trigger:function(a,b){if(typeof this.register[a]=='undefined')this.register[a]=[];var i=this.register[a].length;while(i--)this.register[a][i].func(b)},cancel:function(a){var i;for(eventName in this.register){i=this.register[eventName].length;while(i--)if(a==this.register[eventName][i].funcId){this.register[eventName].splice(i,1);return true}}return false},clear:function(){this.register={}},hasEvent:function(a){return typeof this.register[a]!='undefined'}};if(typeof exports!=='undefined')exports.EventHandler=c;else window.EventHandler=c})();var sEventHandler=(function(){var a;return{getInstance:function(){if(!a)a=new EventHandler();return a}}})();
  /* handleCategories */ var handleCategories=function(c){c=extend({canvas:false,templates:{main:'<ul class="categories js_categories"></ul>',category:'<li class="js_category filter-item" data-slug="<%= slug %>"><a><%= category %></a><i class="icon-remove"></i></li>'},triggeredEvents:{newSelect:'newSelect'},triggerEvents:{loading:'loading',loadSuccess:'success',loadFail:'fail'},classes:{disabled:'disabled',active:'active'},selectors:{categories:'.js_categories',category:'.js_category'},categories:[]},c);var d,enabled=true,eh=sEventHandler.getInstance(),init=function(){if(!c.categories.length)return _removeCanvas();_createElement();forEach(c.categories,function(a){var b={slug:a.s,category:a.c},catElem=_createCategoryElement(b);addEvent(catElem,'click',function(e){preventDefault(e);if(enabled)eh.trigger(c.triggeredEvents.newSelect,{category:b.slug})});el(c.canvas,c.selectors.categories).appendChild(catElem)});eh.on(c.triggerEvents.loading,_disable);eh.on(c.triggerEvents.loadSuccess,function(a){_setActiveCategory(a.category);_enable()})},_createElement=function(){var a=document.createElement('div');a.innerHTML=new EJS({text:c.templates.main}).render();d=a.childNodes[0];c.canvas.appendChild(d)},_removeCanvas=function(){var a=c.canvas.parentNode.parentNode;a.removeChild(previousObject(parent.parentNode));a.removeChild(parent.parentNode)},_createCategoryElement=function(a){var b=document.createElement('ul');b.className=c.classes.category;b.innerHTML=new EJS({text:c.templates.category}).render(a);return b.childNodes[0]},_enable=function(){enabled=true;removeClass(d,c.classes.disabled)},_disable=function(){enabled=false;addClass(d,c.classes.enabled)},_setActiveCategory=function(b){forEach(els(d,c.selectors.category),function(a){(a.getAttribute('data-slug')==b?addClass:removeClass)(a,c.classes.active)})};init()};
  /* handleTags */ var handleTags=function(d){d=extend({tags:false,usedSlugs:false,classes:{disabled:'disabled',active:'active',item:'filter-item',list:'js_tags'},events:{newSelect:'load',loading:'loading',loadSuccess:'success',loadFail:'fail',addTag:'newtag'},attributes:{slug:'data-slug'},templates:{head:'<div class="pblock-head at5"><i class="icon-tags"></i><span><%= tags %></span></div>',body:'<div class="pblock-body"><ul class="ptags content js_tags"></ul></div>',item:'<a href="#" data-slug="<%= slug %>"><%= label %></a>'},canvas:false,decorate:false,},d);var f=true,element,selection=[],tag=false,usedSlugs=[],eh=sEventHandler.getInstance(),run=function(){if(d.usedSlugs)usedSlugs=d.usedSlugs;element=_createElement();for(var i in d.tags){if(!d.usedSlugs)usedSlugs.push(d.tags[i].s);if(!d.usedSlugs||contains(d.usedSlugs,d.tags[i].s)){_createTag({slug:d.tags[i].s,label:d.tags[i].t})}}eh.on(d.events.loadSuccess,function(b){selection=(typeof b.tags=='undefined')?[]:b.tags;if((typeof selection=='string')&&(selection.indexOf(',')!=-1)){selection=selection.split(',')}else if(typeof selection=='string'){selection=[selection]}forEach(els(element,'li'),function(a){if(contains(selection,el(a,'a').getAttribute(d.attributes.slug))){if(!hasClass(a,d.classes.active))addClass(a,d.classes.active)}else{if(hasClass(a,d.classes.active))removeClass(a,d.classes.active)}});_enable()});eh.on(d.events.loading,function(a){_disable()});return{getTags:function(){return d.tags},removeTag:_removeTag,createTag:_createTag}},_createTag=function(a){var b=document.createElement('li'),ejs=new EJS({text:d.templates.item});b.innerHTML=ejs.render(a);addClass(b,d.classes.item);_addTagBehavior(b);element.appendChild(b);return b},_removeTag=function(a){if(usedSlugs.indexOf(a)!==-1)usedSlugs.slice(usedSlugs.indexOf(a),1);var b=els(element,'li');for(var i=b.length-1;i>=0;i--){if(el(b[i],'a').getAttribute(d.attributes.slug)==a){element.removeChild(b[i]);return}}},_addTagBehavior=function(a){addEvent(a,'click',function(e){preventDefault(e);if(hasClass(a,d.classes.active)){_tagUnselect(a)}else{_tagSelect(a)}})},_tagSelect=function(b){if(!f)return;var c=[];forEach(selection,function(a){if(usedSlugs.indexOf(a)==-1)c.push(a)});c.push(el(b,'a').getAttribute(d.attributes.slug));eh.trigger(d.events.newSelect,{tags:c})},_tagUnselect=function(a){if(!f)return;var b=el(a,'a').getAttribute(d.attributes.slug);selection.splice(selection.indexOf(b),1);eh.trigger(d.events.newSelect,{tags:selection.length?selection:null})},_enable=function(){removeClass(element,d.classes.disabled);f=true},_disable=function(){addClass(element,d.classes.disabled);f=false},_createElement=function(){if(!d.decorate){var a=document.createElement('ul');d.canvas.appendChild(a);return a}var a=document.createElement('div'),tagElem;a.innerHTML=new EJS({text:d.templates.head}).render(d.labels)+new EJS({text:d.templates.body}).render(d.labels);while(a.childNodes.length){if(els(a.childNodes[0],'.'+d.classes.list).length)tagElem=el(a.childNodes[0],'.'+d.classes.list);d.canvas.insertAdjacentElement('beforebegin',a.childNodes[0])}d.canvas.parentNode.removeChild(d.canvas);return tagElem};return run()};
  /* handleProgramControlData v0.1 */ function handleProgramControlData(c,d,e){var f=function(a,b){for(aIndex in a){for(lIndex in a[aIndex].l){b({articleId:aIndex,article:a[aIndex],locationSlug:lIndex,location:a[aIndex].l[lIndex]})}}};var g=function(b){callbackData=[];forEach(c,function(){callbackData.push({})});f(b.a,function(a){var i=c.length;while(i--)c[i](callbackData[i],a)});d(b,callbackData)};if(typeof e!='string'){return g(e)}else{remote.getJsonp(e,{data:{format:'jsonp',getcontroldata:''}},function(a,b){g(b)})}};
  /* ejs_production */ (function(){var rsplit=function(string,regex){var result=regex.exec(string),retArr=new Array(),first_idx,last_idx,first_bit;while(result!=null){first_idx=result.index;last_idx=regex.lastIndex;if((first_idx)!=0){first_bit=string.substring(0,first_idx);retArr.push(string.substring(0,first_idx));string=string.slice(first_idx)}retArr.push(result[0]);string=string.slice(result[0].length);result=regex.exec(string)}if(!string==""){retArr.push(string)}return retArr},chop=function(string){return string.substr(0,string.length-1)},extend=function(d,s){for(var n in s){if(s.hasOwnProperty(n)){d[n]=s[n]}}};EJS=function(options){options=typeof options=="string"?{view:options}:options;this.set_options(options);if(options.precompiled){this.template={};this.template.process=options.precompiled;EJS.update(this.name,this);return }if(options.element){if(typeof options.element=="string"){var name=options.element;options.element=document.getElementById(options.element);if(options.element==null){throw name+"does not exist!"}}if(options.element.value){this.text=options.element.value}else{this.text=options.element.innerHTML}this.name=options.element.id;this.type="["}else{if(options.url){options.url=EJS.endExt(options.url,this.extMatch);this.name=this.name?this.name:options.url;var url=options.url;var template=EJS.get(this.name,this.cache);if(template){return template}if(template==EJS.INVALID_PATH){return null}try{this.text=EJS.request(url+(this.cache?"":"?"+Math.random()))}catch(e){}if(this.text==null){throw ({type:"EJS",message:"There is no template at "+url})}}}var template=new EJS.Compiler(this.text,this.type);template.compile(options,this.name);EJS.update(this.name,this);this.template=template};EJS.prototype={render:function(object,extra_helpers){object=object||{};this._extra_helpers=extra_helpers;var v=new EJS.Helpers(object,extra_helpers||{});return this.template.process.call(object,object,v)},update:function(element,options){if(typeof element=="string"){element=document.getElementById(element)}if(options==null){_template=this;return function(object){EJS.prototype.update.call(_template,element,object)}}if(typeof options=="string"){params={};params.url=options;_template=this;params.onComplete=function(request){var object=eval(request.responseText);EJS.prototype.update.call(_template,element,object)};EJS.ajax_request(params)}else{element.innerHTML=this.render(options)}},out:function(){return this.template.out},set_options:function(options){this.type=options.type||EJS.type;this.cache=options.cache!=null?options.cache:EJS.cache;this.text=options.text||null;this.name=options.name||null;this.ext=options.ext||EJS.ext;this.extMatch=new RegExp(this.ext.replace(/\./,"."))}};EJS.endExt=function(path,match){if(!path){return null}match.lastIndex=0;return path+(match.test(path)?"":this.ext)};EJS.Scanner=function(source,left,right){extend(this,{left_delimiter:left+"%",right_delimiter:"%"+right,double_left:left+"%%",double_right:"%%"+right,left_equal:left+"%=",left_comment:left+"%#"});this.SplitRegexp=left=="["?/(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/:new RegExp("("+this.double_left+")|(%%"+this.double_right+")|("+this.left_equal+")|("+this.left_comment+")|("+this.left_delimiter+")|("+this.right_delimiter+"\n)|("+this.right_delimiter+")|(\n)");this.source=source;this.stag=null;this.lines=0};EJS.Scanner.to_text=function(input){if(input==null||input===undefined){return""}if(input instanceof Date){return input.toDateString()}if(input.toString){return input.toString()}return""};EJS.Scanner.prototype={scan:function(block){scanline=this.scanline;regex=this.SplitRegexp;if(!this.source==""){var source_split=rsplit(this.source,/\n/);for(var i=0;i<source_split.length;i++){var item=source_split[i];this.scanline(item,regex,block)}}},scanline:function(line,regex,block){this.lines++;var line_split=rsplit(line,regex);for(var i=0;i<line_split.length;i++){var token=line_split[i];if(token!=null){try{block(token,this)}catch(e){throw {type:"EJS.Scanner",line:this.lines}}}}}};EJS.Buffer=function(pre_cmd,post_cmd){this.line=new Array();this.script="";this.pre_cmd=pre_cmd;this.post_cmd=post_cmd;for(var i=0;i<this.pre_cmd.length;i++){this.push(pre_cmd[i])}};EJS.Buffer.prototype={push:function(cmd){this.line.push(cmd)},cr:function(){this.script=this.script+this.line.join("; ");this.line=new Array();this.script=this.script+"\n"},close:function(){if(this.line.length>0){for(var i=0;i<this.post_cmd.length;i++){this.push(pre_cmd[i])}this.script=this.script+this.line.join("; ");line=null}}};EJS.Compiler=function(source,left){this.pre_cmd=["var ___ViewO = [];"];this.post_cmd=new Array();this.source=" ";if(source!=null){if(typeof source=="string"){source=source.replace(/\r\n/g,"\n");source=source.replace(/\r/g,"\n");this.source=source}else{if(source.innerHTML){this.source=source.innerHTML}}if(typeof this.source!="string"){this.source=""}}left=left||"<";var right=">";switch(left){case"[":right="]";break;case"<":break;default:throw left+" is not a supported deliminator";break}this.scanner=new EJS.Scanner(this.source,left,right);this.out=""};EJS.Compiler.prototype={compile:function(options,name){options=options||{};this.out="";var put_cmd="___ViewO.push(";var insert_cmd=put_cmd;var buff=new EJS.Buffer(this.pre_cmd,this.post_cmd);var content="";var clean=function(content){content=content.replace(/\\/g,"\\\\");content=content.replace(/\n/g,"\\n");content=content.replace(/"/g,'\\"');return content};this.scanner.scan(function(token,scanner){if(scanner.stag==null){switch(token){case"\n":content=content+"\n";buff.push(put_cmd+'"'+clean(content)+'");');buff.cr();content="";break;case scanner.left_delimiter:case scanner.left_equal:case scanner.left_comment:scanner.stag=token;if(content.length>0){buff.push(put_cmd+'"'+clean(content)+'")')}content="";break;case scanner.double_left:content=content+scanner.left_delimiter;break;default:content=content+token;break}}else{switch(token){case scanner.right_delimiter:switch(scanner.stag){case scanner.left_delimiter:if(content[content.length-1]=="\n"){content=chop(content);buff.push(content);buff.cr()}else{buff.push(content)}break;case scanner.left_equal:buff.push(insert_cmd+"(EJS.Scanner.to_text("+content+")))");break}scanner.stag=null;content="";break;case scanner.double_right:content=content+scanner.right_delimiter;break;default:content=content+token;break}}});if(content.length>0){buff.push(put_cmd+'"'+clean(content)+'")')}buff.close();this.out=buff.script+";";var to_be_evaled="/*"+name+"*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {"+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";try{eval(to_be_evaled)}catch(e){if(typeof JSLINT!="undefined"){JSLINT(this.out);for(var i=0;i<JSLINT.errors.length;i++){var error=JSLINT.errors[i];if(error.reason!="Unnecessary semicolon."){error.line++;var e=new Error();e.lineNumber=error.line;e.message=error.reason;if(options.view){e.fileName=options.view}throw e}}}else{throw e}}}};EJS.config=function(options){EJS.cache=options.cache!=null?options.cache:EJS.cache;EJS.type=options.type!=null?options.type:EJS.type;EJS.ext=options.ext!=null?options.ext:EJS.ext;var templates_directory=EJS.templates_directory||{};EJS.templates_directory=templates_directory;EJS.get=function(path,cache){if(cache==false){return null}if(templates_directory[path]){return templates_directory[path]}return null};EJS.update=function(path,template){if(path==null){return }templates_directory[path]=template};EJS.INVALID_PATH=-1};EJS.config({cache:true,type:"<",ext:".ejs"});EJS.Helpers=function(data,extras){this._data=data;this._extras=extras;extend(this,extras)};EJS.Helpers.prototype={view:function(options,data,helpers){if(!helpers){helpers=this._extras}if(!data){data=this._data}return new EJS(options).render(data,helpers)},to_text:function(input,null_text){if(input==null||input===undefined){return null_text||""}if(input instanceof Date){return input.toDateString()}if(input.toString){return input.toString().replace(/\n/g,"<br />").replace(/''/g,"'")}return""}};EJS.newRequest=function(){var factories=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new XMLHttpRequest()},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var i=0;i<factories.length;i++){try{var request=factories[i]();if(request!=null){return request}}catch(e){continue}}};EJS.request=function(path){var request=new EJS.newRequest();request.open("GET",path,false);try{request.send(null)}catch(e){return null}if(request.status==404||request.status==2||(request.status==0&&request.responseText=="")){return null}return request.responseText};EJS.ajax_request=function(params){params.method=(params.method?params.method:"GET");var request=new EJS.newRequest();request.onreadystatechange=function(){if(request.readyState==4){if(request.status==200){params.onComplete(request)}else{params.onComplete(request)}}};request.open(params.method,params.url);request.send(null)}})();EJS.Helpers.prototype.date_tag=function(C,O,A){if(!(O instanceof Date)){O=new Date()}var B=["January","February","March","April","May","June","July","August","September","October","November","December"];var G=[],D=[],P=[];var J=O.getFullYear();var H=O.getMonth();var N=O.getDate();for(var M=J-15;M<J+15;M++){G.push({value:M,text:M})}for(var E=0;E<12;E++){D.push({value:(E),text:B[E]})}for(var I=0;I<31;I++){P.push({value:(I+1),text:(I+1)})}var L=this.select_tag(C+"[year]",J,G,{id:C+"[year]"});var F=this.select_tag(C+"[month]",H,D,{id:C+"[month]"});var K=this.select_tag(C+"[day]",N,P,{id:C+"[day]"});return L+F+K};EJS.Helpers.prototype.form_tag=function(B,A){A=A||{};A.action=B;if(A.multipart==true){A.method="post";A.enctype="multipart/form-data"}return this.start_tag_for("form",A)};EJS.Helpers.prototype.form_tag_end=function(){return this.tag_end("form")};EJS.Helpers.prototype.hidden_field_tag=function(A,C,B){return this.input_field_tag(A,C,"hidden",B)};EJS.Helpers.prototype.input_field_tag=function(A,D,C,B){B=B||{};B.id=B.id||A;B.value=D||"";B.type=C||"text";B.name=A;return this.single_tag_for("input",B)};EJS.Helpers.prototype.is_current_page=function(A){return(window.location.href==A||window.location.pathname==A?true:false)};EJS.Helpers.prototype.link_to=function(B,A,C){if(!B){var B="null"}if(!C){var C={}}if(C.confirm){C.onclick=' var ret_confirm = confirm("'+C.confirm+'"); if(!ret_confirm){ return false;} ';C.confirm=null}C.href=A;return this.start_tag_for("a",C)+B+this.tag_end("a")};EJS.Helpers.prototype.submit_link_to=function(B,A,C){if(!B){var B="null"}if(!C){var C={}}C.onclick=C.onclick||"";if(C.confirm){C.onclick=' var ret_confirm = confirm("'+C.confirm+'"); if(!ret_confirm){ return false;} ';C.confirm=null}C.value=B;C.type="submit";C.onclick=C.onclick+(A?this.url_for(A):"")+"return false;";return this.start_tag_for("input",C)};EJS.Helpers.prototype.link_to_if=function(F,B,A,D,C,E){return this.link_to_unless((F==false),B,A,D,C,E)};EJS.Helpers.prototype.link_to_unless=function(E,B,A,C,D){C=C||{};if(E){if(D&&typeof D=="function"){return D(B,A,C,D)}else{return B}}else{return this.link_to(B,A,C)}};EJS.Helpers.prototype.link_to_unless_current=function(B,A,C,D){C=C||{};return this.link_to_unless(this.is_current_page(A),B,A,C,D)};EJS.Helpers.prototype.password_field_tag=function(A,C,B){return this.input_field_tag(A,C,"password",B)};EJS.Helpers.prototype.select_tag=function(D,G,H,F){F=F||{};F.id=F.id||D;F.value=G;F.name=D;var B="";B+=this.start_tag_for("select",F);for(var E=0;E<H.length;E++){var C=H[E];var A={value:C.value};if(C.value==G){A.selected="selected"}B+=this.start_tag_for("option",A)+C.text+this.tag_end("option")}B+=this.tag_end("select");return B};EJS.Helpers.prototype.single_tag_for=function(A,B){return this.tag(A,B,"/>")};EJS.Helpers.prototype.start_tag_for=function(A,B){return this.tag(A,B)};EJS.Helpers.prototype.submit_tag=function(A,B){B=B||{};B.type=B.type||"submit";B.value=A||"Submit";return this.single_tag_for("input",B)};EJS.Helpers.prototype.tag=function(C,E,D){if(!D){var D=">"}var B=" ";for(var A in E){if(E[A]!=null){var F=E[A].toString()}else{var F=""}if(A=="Class"){A="class"}if(F.indexOf("'")!=-1){B+=A+'="'+F+'" '}else{B+=A+"='"+F+"' "}}return"<"+C+B+D};EJS.Helpers.prototype.tag_end=function(A){return"</"+A+">"};EJS.Helpers.prototype.text_area_tag=function(A,C,B){B=B||{};B.id=B.id||A;B.name=B.name||A;C=C||"";if(B.size){B.cols=B.size.split("x")[0];B.rows=B.size.split("x")[1];delete B.size}B.cols=B.cols||50;B.rows=B.rows||4;return this.start_tag_for("textarea",B)+C+this.tag_end("textarea")};EJS.Helpers.prototype.text_tag=EJS.Helpers.prototype.text_area_tag;EJS.Helpers.prototype.text_field_tag=function(A,C,B){return this.input_field_tag(A,C,"text",B)};EJS.Helpers.prototype.url_for=function(A){return'window.location="'+A+'";'};EJS.Helpers.prototype.img_tag=function(B,C,A){A=A||{};A.src=B;A.alt=C;return this.single_tag_for("img",A)}
  /* handleCalendar v0.1.2 */ var extractDate=function(b,c){forEach(c.location.d,function(a){if(typeof b[a]=='undefined'){b[a]={count:0,locations:[]}}b[a].locations.push(c.locationSlug);b[a].count++})};var createDateSelect=function(c,d,f,g){g=extend({triggerEvents:{disable:'caldisable',refresh:'calrefresh',enable:'calenable',mobileOn:'mobileon',mobileOff:'mobileoff'},triggeredEvents:{dateSelect:'periodselected'},disabledClass:'disabled',displayNoneClass:'display-none',lang:'en',mobile:false,nav:{prev:'<i class="icon-chevron-left"></i>',next:'<i class="icon-chevron-right"></i>'}},g);var h=true,calendarDisplayed=false,calendar=false,filterElem=getElementsByClassName(c,'filter-item'),showElem=getElementsByClassName(c,'js_show'),hideElem=getElementsByClassName(c,'js_hide'),calendarCanvas=getElementsByClassName(c,'calendar-canvas')[0],mobile=g.mobile,init=function(){showElem=showElem.length?showElem[0]:false;hideElem=showElem.length?showElem[0]:false;filterElem=filterElem.length?filterElem[0]:false;f.on(g.triggerEvents.mobileOn,function(){_mobileOn()});f.on(g.triggerEvents.mobileOff,function(){_mobileOff()});if(mobile){_mobileOn()}else{_mobileOff()}if(showElem){addEvent(showElem,'click',function(e){if(h&&!calendarDisplayed){_hideShowButton();_showHideButton();_showCalendar()}});addEvent(hideElem,'click',function(e){if(h&&calendarDisplayed){_showShowButton();_hideHideButton();_hideCalendar()}})}else{_showCalendar()}addEvent(getElementsByClassName(c,'icon-remove')[0],'click',function(){if(h){f.trigger(g.triggeredEvents.dateSelect,{from:null,to:null})}});f.on(g.triggerEvents.disable,function(){_disable()});f.on(g.triggerEvents.enable,function(){_enable()});f.on(g.triggerEvents.refresh,function(a){_enable();if(typeof a.from=='undefined'){if(calendar)calendar.setSelected(false);if(filterElem)_hideFilter()}else{if(typeof a.to=='undefined')a.to=a.from;if(calendar)calendar.setSelected({begin:new Date(a.from.replace(/-/g,"/")),end:new Date(a.to.replace(/-/g,"/"))});if(filterElem)_showFilter(a.from,a.to)}if(calendar)calendar.enable()})},_showFilter=function(a,b){filterElem.getElementsByTagName('span')[0].innerHTML=a==b?a:a+' '+b;removeClass(filterElem,g.displayNoneClass)},_hideFilter=function(){filterElem.getElementsByTagName('span')[0].innerHTML='';addClass(filterElem,g.displayNoneClass)},_showCalendar=function(){if(!calendar)calendar=new CibulCalendar(calendarCanvas,{filter:function(a,b){if(typeof d[a.getFullYear()+'-'+(a.getMonth()<9?'0':'')+(a.getMonth()+1)+'-'+(a.getDate()<10?'0':'')+a.getDate()]!='undefined'){b.push('hasdates')}return b},onSelect:function(a){f.trigger(g.triggeredEvents.dateSelect,{from:a.begin.getFullYear()+'-'+(a.begin.getMonth()<9?'0':'')+(a.begin.getMonth()+1)+'-'+(a.begin.getDate()<10?'0':'')+a.begin.getDate(),to:a.end.getFullYear()+'-'+(a.end.getMonth()<9?'0':'')+(a.end.getMonth()+1)+'-'+(a.end.getDate()<10?'0':'')+a.end.getDate()})},navDomContent:{prev:g.nav.prev,next:g.nav.next},lang:g.lang});removeClass(calendarCanvas,g.displayNoneClass);calendarDisplayed=true},_hideCalendar=function(){addClass(calendarCanvas,g.displayNoneClass);calendarDisplayed=false},_disable=function(){if(filterElem)addClass(filterElem,g.disabledClass);if(calendar)calendar.disable();h=false},_enable=function(){if(filterElem)removeClass(filterElem,g.disabledClass);if(calendar)calendar.enable();h=true},_showHideButton=function(){if(hideElem)removeClass(hideElem,g.displayNoneClass)},_hideHideButton=function(){if(hideElem)addClass(hideElem,g.displayNoneClass)},_showShowButton=function(){if(showElem)removeClass(showElem,g.displayNoneClass)},_hideShowButton=function(){if(showElem)addClass(showElem,g.displayNoneClass)},_mobileOn=function(){_showCalendar();_hideShowButton();_hideHideButton()},_mobileOff=function(){_hideCalendar();_showShowButton();_hideHideButton()};init()};

  /*!
   * CibulCalendar v0.2.3 ~ Copyright (c) 2013 Kari Olafsson, http://tech.openagenda.com
   * Released under MIT license, http://opensource.org/licenses/mit-license.php
   */
  eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(k(){q f=\'6M\'2v H&&!(/6J-6H/6G).2y(6x.6u),1r=k(a,b){h(!b)b={};h(!2E(a))p;11(2,{l:11({2e:T,2j:\'2m\',O:T,1S:1,L:s,1w:s,2H:\'<1i Y="6l"><A Y="6j"><3 Y="2I"><8>#2J</8></3><3 Y="6f"><8 Y="1N">#2M</8></3><3 Y="2O"><8>#2P</8></3></A><A Y="62"><3><8>#61</8></3><3><8>#60</8></3><3><8>#5U</8></3><3><8>#5T</8></3><3><8>#5R</8></3><3><8>#5O</8></3><3><8>#5N</8></3></A></1i><1i Y="2X"><A><3#5J><8>#5I</8></3><3#5D><8>#5C</8></3><3#5B><8>#5y</8></3><3#5x><8>#5w</8></3><3#5v><8>#5t</8></3><3#5s><8>#5r</8></3><3#5q><8>#5p</8></3></A><A><3#5n><8>#5m</8></3><3#5l><8>#5k</8></3><3#5j><8>#5i</8></3><3#5h><8>#5f</8></3><3#5e><8>#5c</8></3><3#5b><8>#58</8></3><3#57><8>#54</8></3></A><A><3#51><8>#50</8></3><3#4Z><8>#4Y</8></3><3#4W><8>#4V</8></3><3#4U><8>#4R</8></3><3#4Q><8>#4P</8></3><3#4O><8>#4N</8></3><3#4L><8>#4K</8></3></A><A><3#4J><8>#4D</8></3><3#4y><8>#4x</8></3><3#4w><8>#4v</8></3><3#4u><8>#4r</8></3><3#4q><8>#4p</8></3><3#4o><8>#4j</8></3><3#4i><8>#4g</8></3></A><A><3#4f><8>#4e</8></3><3#4d><8>#4c</8></3><3#4b><8>#4a</8></3><3#49><8>#47</8></3><3#45><8>#44</8></3><3#41><8>#40</8></3><3#3W><8>#3V</8></3></A><A><3#3U><8>#3T</8></3><3#3S><8>#3R</8></3><3#3E><8>#3D</8></3><3#3J><8>#6n</8></3><3#6o><8>#6p</8></3><3#6r><8>#6v</8></3><3#6w><8>#6C</8></3></A></1i>\',m:11({I:\'6F\',2w:\'2I\',2u:\'2O\',1p:\'2X\',L:\'L\',3g:\'6L\',17:\'17\',1N:\'1N\',2q:\'6D\',2n:\'6B\',1O:\'1O\',18:\'6t\',},b.m?b.m:{}),2l:{1M:\'<\',1m:\'>\'},1K:11({2m:[\'6m\',\'6i\',\'6h\',\'6a\',\'67\',\'66\',\'65\',\'64\',\'63\',\'5Y\',\'5X\',\'5W\'],2T:[\'5V\',\'Fé5L\',\'5K\',\'5H\',\'5G\',\'5F\',\'5E\',\'5uût\',\'5o\',\'5g\',\'36\',\'Dé3x\'],38:[\'5a\',\'59\',\'3b\',\'55\',\'53\',\'52\',\'4S\',\'4M\',\'4I\',\'4F\',\'36\',\'4E\'],3i:[\'4B\',\'4t\',\'3b\',\'4s\',\'4n\',\'4l\',\'4k\',\'48\',\'46\',\'3Z\',\'3P\',\'3L\']},b.1K?b.1K:{}),2p:11({2m:[\'3H\',\'3F\',\'3y\',\'5d\',\'3z\',\'3A\',\'3B\'],2T:[\'3C\',\'2h\',\'2g\',\'3w\',\'3G\',\'3v\',\'3I\'],38:[\'3u\',\'2h\',\'2g\',\'3w\',\'3K\',\'3v\',\'3t\'],3i:[\'3u\',\'2h\',\'2g\',\'3M\',\'3N\',\'3O\',\'3t\']},b.2p),3s:3Q,},b),S:s,14:s,1d:s,u:a,});2.O=2.l.O;2.1G(2.l.L);2.1F()};1r.3X={3Y:k(){2.O=s;3r(r(2.u,2.l.m.I)[0],2.l.m.1O)},43:k(){2.O=T;29(r(2.u,2.l.m.I)[0],2.l.m.1O)},28:k(){h(!2.O)p;2.3q()},26:k(){h(!2.O)p;2.3p()},1G:k(a,b){h(a){h(B a.v==\'K\')a={v:a,E:a};h(B b==\'K\')b=T;2.J=(a.v>a.E)?{v:a.E,E:a.v}:a;h(2.J&&b){2.1z(w U(2.J.v.4h()))}G{2.1t(2.J)}}G{2.J=s;2.3o()}},3n:k(){h(B 2.J==\'K\')2.J=s;p 2.J},4m:k(){p r(r(2.S,2.l.m.1p)[0],2.l.m.L)},3m:k(){q b=2;R(r(2.S,2.l.m.2w)[0],\'1g\',k(a){b.26()});R(r(2.S,2.l.m.2u)[0],\'1g\',k(a){b.28()});1q(r(2.S,2.l.m.1p)[0].1a(\'3\'),k(a){b.3l(a)});R(r(2.S,2.l.m.1N)[0],\'1g\',k(){b.3k()})},3k:k(){h(!2.O)p;q a=2.16();2.1G({v:w U(a.X(),a.C(),1),E:w U(a.X(),a.C()+1,0)});2.1F();h(B 2.l.1l!=\'K\')2.l.1l(2.J)},3l:k(b){q c=2;R(b,[\'4z\',\'4A\'],k(a){h(c.1d||!c.O)p;c.1d=T;c.3j(b)});R(b,[\'4C\',\'2o\'],k(a){h(!c.1d||!c.O)p;c.3h(c.2t(b,a))});R(b,[\'4G\',\'4H\'],k(a){h(!c.1d||!c.O)p;c.1d=s;c.3f(b);h(r(c.u,c.l.m.18).Z)c.u.1H(r(c.u,c.l.m.18)[0])})},2k:k(a){h(a.3e)a.3e()},3j:k(a){h(f)R(V.1a(\'2i\')[0],\'2o\',2.2k);2.J=s;2.1A=a;2.13=2.1B(a);2.14={v:2.13,E:2.13};2.1t(2.14,T)},3h:k(a){h(2.1A==a)p;2.1A=a;q b=2.1B(a);h(2.l.2e){2.14=(b<2.13)?{v:b,E:2.13}:{v:2.13,E:b}}G{2.14={v:b,E:b}}2.3d(a,b);2.1t(2.14,T)},3f:k(a){h(f)V.1a(\'2i\')[0].4T(\'2o\',2.2k,s);2.1A=s;2.1G(2.14,s);2.1t(2.J);2.14=s;h(B 2.l.1l!=\'K\')2.l.1l(2.l.2e?2.J:2.J.v);2.1C()},3d:k(a,b){q c=s,z=2,1D=(z.16().C()==b.C());4X(1x(a.1j)){2a 0:h((1x(a)==0)||!1D)c=\'1M\';25;2a 4:h(!1D)c=\'1m\';25;2a 5:h((1x(a)==6)||!1D)c=\'1m\';25};h(c){h(B 2.1v==\'K\')2.1v=3c(k(){h(c==\'1m\'){z.28()}G h(c==\'1M\'){z.26()}z.1C()},2.l.3s)}G{2.1C()}},1C:k(){h(2.1v)56(2.1v);2.1v=K},1B:k(a){q b=1x(a.1j),1E=0,1R=3a(a.1a(\'8\')[0].39,10),19=2.16();h((b==0)&&(1R>10))1E=-1;h((b>=4)&&(1R<12))1E=1;p w U(19.X(),19.C()+1E,1R)},3q:k(){q a=2.16();a.37(a.C()+1);2.1z(a)},3p:k(){q a=2.16();a.37(a.C()-1);2.1z(a)},1z:k(a){2.19=a;2.1F()},16:k(){h(B 2.19==\'K\')2.19=w U();p 2.19},3o:k(){q b=2;h(!2.S)p;1q(r(r(2.S,2.l.m.1p)[0],2.l.m.L),k(a){29(a,b.l.m.L)})},1t:k(b,c){h(!2.S)p;q d=s,i=0,m,z=2,35=z.16().C(),c=(B c==\'K\')?s:c;1q(r(2.S,2.l.m.1p)[0].1a(\'3\'),k(a){m=[];h(!d)d=z.1B(a);G d.1Z(d.1c()+1);h(z.1X(d,b))m.W(c?z.l.m.3g:z.l.m.L);h(z.1V(d))m.W(z.l.m.17);h(d.C()!=35)m.W(z.l.m[i++<7?\'2q\':\'2n\']);h(z.l.1w)m=z.l.1w(d,m);a.Q=m.34(\' \')})},33:k(a){q i,N=2.l.2H,1e,1o,1n=0,L=2.3n(),1y=2.32(a.C(),a.X());1f(i=0;i<1y.Z;i++){1e=w 1u(\'#d\'+(i>9?\'\':\'0\')+i);N=N.1b(1e,1y[i]);q b=3a(1y[i],10);q c=[];1e=w 1u(\'#5z\'+(i>9?\'\':\'0\')+i);1n=0;h((i<7)&&(b>10)){c.W(2.l.m.2q);1n=-1}G{h((i>27)&&(b<12)){c.W(2.l.m.2n);1n=1}}1o=w U(a.X(),a.C()+1n,b);h(L)h(2.1X(1o,L))c.W(2.l.m.L);h(2.1V(1o)){c.W(2.l.m.17)}h(2.l.1w)2.l.1w(1o,c);N=N.1b(1e,c.Z?\' Y="\'+c.34(\' \')+\'"\':\'\')};1f(i=0;i<7;i++){1e=w 1u(\'#5A\'+i);N=N.1b(1e,2.l.2p[2.l.2j][(i+2.l.1S)%7])};N=N.1b(\'#2M\',2.l.1K[2.l.2j][a.C()]+\' \'+a.X());N=N.1b(\'#2J\',2.l.2l.1M).1b(\'#2P\',2.l.2l.1m);p N},1F:k(){q a=2.16();h(2.1d){h((a.C()==2.13.C())&&(a.X()==2.13.X())){2.u.1H(r(2.u,2.l.m.I)[0]);r(2.u,2.l.m.18)[0].2f(\'15\',\'1I:31;\');r(2.u,2.l.m.18)[0].Q=2.l.m.I;p}G{h(!r(2.u,2.l.m.18).Z){r(2.u,2.l.m.I)[0].2f(\'15\',\'1I:30;\');r(2.u,2.l.m.I)[0].Q=2.l.m.18}G{2.u.1H(r(2.u,2.l.m.I)[0])}}}G{h(r(2.u,2.l.m.I).Z)2.u.1H(r(2.u,2.l.m.I)[0])}q b=V.2Z(\'1i\');b.Q=2.l.m.I;b.39=2.33(a);2.u.2Y(b);2.S=r(2.u,2.l.m.I)[0];2d(2.u);2.3m()},32:k(a,b){q c=[],P=w U(b,a+1,0),i;i=P.1c();1h(i--)c.2W((i+1)+\'\');P=w U(b,a,1);1h(P.5M()>2.l.1S){P.1Z(P.1c()-1);c.2W(P.1c()+\'\')};P=w U(b,a+1,0);1h(c.Z<42){P.1Z(P.1c()+1);c.W(P.1c()+\'\')}p c},1V:k(a){h(B 2.17==\'K\')2.17=w U().1s();p(a.1s()==2.17)},1X:k(a,b){q c=a.1s();q d={v:b.v.1s(),E:b.E.1s()};h((c==d.v)||(c==d.E))p T;h((a>=b.v)&&(a<=b.E))p T;p s},2t:k(a,b){h(B b==\'K\')p a;h(B b.23==\'K\')p a;p 2V(b.23[0].5P,b.23[0].5Q).1j}};q g=k(b,c){q d=V.5S(b),M,I,1J=s,2U=k(){c=11({1l:2S,2R:\' - \',2Q:\'I-5Z\',21:{20:5,1Y:0}},c?c:{});R(d,\'1g\',1W);R(V.1a(\'2i\')[0],\'1g\',k(){h(!1J)1U();1J=s})},1W=k(){1J=T;h(!M)2N();11(M.15,{1L:\'2L\',20:(d.68+d.69+c.21.20)+\'2K\',1Y:d.6b+c.21.1Y+\'2K\'});M.15.1I=\'31\';d.6c()},1U=k(){h(M)M.15.1I=\'30\'},2N=k(){M=V.2Z(\'1i\');M.Q=c.2Q;h(!d.1j.15.1L)d.1j.15.1L=\'6d\';M.15.1L=\'2L\';R(M,\'1g\',1W);d.1j.2Y(M);w 1r(M,c)},2S=k(a){d.6e=2s(a.v)+(a.v!=a.E?c.2R+2s(a.E):\'\');3c(1U,6g)},2s=k(a){p 2r(a.1c())+\'/\'+2r(a.C()+1)+\'/\'+a.X()},2r=k(n){p(n>9?\'\':\'0\')+n};2U()},11=k(){1f(q i=1;i<1k.Z;i++)1f(q a 2v 1k[i])h(1k[i].6k(a))1k[0][a]=1k[i][a];p 1k[0]},r=k(b,c){q a=[];q d=w 1u(\'(^| )\'+c+\'( |$)\');q e=b.1a("*");1f(q i=0,j=e.Z;i<j;i++)h(d.2y(e[i].Q))a.W(e[i]);p a},2E=k(o){p(B 2G==="2F"?o 6q 2G:o&&B o==="2F"&&o.22===1&&B o.6s==="2D")},1q=k(a,b){1f(q i=0;i<a.Z;i++)b(a[i])},R=k(b,c,d){h(b==1P||b==K)p;h(B c==\'2D\')c=[c];1q(c,k(a){h(b.2C){b.2C(a,d,s)}G h(b.2B){b.2B("2c"+a,d)}G{b["2c"+a]=d}})},2d=k(a){h(a.22==1)a.2f("6y","2c");q b=a.6z;1h(b){2d(b);b=b.6A}},2A=k(a){a=a.2z;1h(a&&a.22!=1)a=a.2z;p a},1x=k(a){q i=0;1h((a=2A(a))!=1P)i++;p i},2b=k(a,b){p(\' \'+a.Q+\' \').6E(\' \'+b+\' \')>-1},3r=k(a,b){h(!2b(a,b))a.Q=a.Q+\' \'+b},29=k(a,b){h(2b(a,b)){q c=w 1u(b,\'g\');a.Q=a.Q.1b(c,\'\')}},2x=k(){h(H.24>0){p(H.V.1Q(0,H.24+H.6I-1)==1P)}G h(H.1T>0){p(H.V.1Q(H.1T+H.6K-1,0)==1P)}p s},2V=k(x,y){h(2x()){p H.V.1Q(x-H.1T,y-H.24)}G{p H.V.1Q(x,y)}};11(H,{1r:1r,6N:g})})();',62,422,'||this|li|||||span|||||||||if|||function|options|classes|||return|var|getElementsByClassName|false||element|begin|new|||self|ul|typeof|getMonth||end||else|window|calendar|selection|undefined|selected|calCanvas|render|enabled|day|className|addEvent|displayedCalendarElement|true|Date|document|push|getFullYear|class|length||extend||anchorDate|preSelection|style|_getDisplayedMonth|today|originCalendar|displayedMonth|getElementsByTagName|replace|getDate|selecting|regexp|for|click|while|div|parentNode|arguments|onSelect|next|varMonth|curDate|calendarBody|forEach|CibulCalendar|toDateString|_renderSelection|RegExp|hoverTimer|filter|getChildIndex|monthStack|_setDisplayedMonth|currentListItem|_getDateFromElement|_clearHoverTimer|sameMonth|incMonth|_renderCalendar|setSelected|removeChild|display|inFocus|monthNames|position|prev|month|disabled|null|elementFromPoint|dateValue|firstDayOfWeek|pageXOffset|_blur|_isToday|_focus|_isWithinRange|left|setDate|top|offset|nodeType|touches|pageYOffset|break|showPrevious||showNext|removeClass|case|hasClass|on|makeUnselectable|range|setAttribute|Mar|Lun|body|lang|_preventDefaultBodyMove|navDomContent|en|nextMonthDate|touchmove|weekDays|prevMonthDate|_fZ|_dateToString|_getActualListItem|navDomNext|in|navDomPrev|elementFromPointIsUsingViewPortCoordinates|test|previousSibling|previousObject|attachEvent|addEventListener|string|isElement|object|HTMLElement|template|calprevmonth|navprev|px|absolute|title|_createCalendar|calnextmonth|navnext|canvasClass|separator|_onSelect|fr|_init|elementFromDocumentPoint|unshift|calbody|appendChild|createElement|none|block|_getMonthStack|_generateCalendarHTML|join|currentMonth|Novembre|setMonth|it|innerHTML|parseInt|Marzo|setTimeout|_switchMonthOnTimer|preventDefault|_completePreselection|preSelected|_updatePreselection|es|_beginPreselection|_selectMonth|_applySelectionBehavior|_applyBehavior|_getSelected|_clearSelectionRender|_decDisplayedMonth|_incDisplayedMonth|addClass|switchMonthOnHoverDelay|Sab|Dom|Ven|Mer|cembre|Tue|Thu|Fri|Sat|Dim|d37|cls37|Mon|Jeu|Sun|Sam|cls38|Gio|Diciembre|Mie|Jue|Vie|Noviembre|800|d36|cls36|d35|cls35|d34|cls34|prototype|disable|Octubre|d33|cls33||enable|d32|cls32|Septiembre|d31|Augosto|cls31|d30|cls30|d29|cls29|d28|cls28|d27|getTime|cls27|d26|Julio|Junio|_getSelectedElements|Mayo|cls26|d25|cls25|d24|Abril|Febrero|cls24|d23|cls23|d22|cls22|touchstart|mousedown|Enero|mouseover|d21|Dicembre|Ottobre|mouseup|touchend|Settembre|cls21|d20|cls20|Agosto|d19|cls19|d18|cls18|d17|Luglio|removeEventListener|cls17|d16|cls16|switch|d15|cls15|d14|cls14|Giugno|Maggio|d13|Aprile|clearTimeout|cls13|d12|Febbraio|Gennaio|cls12|d11|Wed|cls11|d10|Octobre|cls10|d09|cls09|d08|cls08|d07|cls07|Septembre|d06|cls06|d05|cls05|d04|Ao|cls04|d03|cls03|d02|cls|wd|cls02|d01|cls01|Juillet|Juin|Mai|Avril|d00|cls00|Mars|vrier|getDay|wd6|wd5|pageX|pageY|wd4|getElementById|wd3|wd2|Janvier|December|November|October|canvas|wd1|wd0|calweekdays|September|August|July|June|May|offsetTop|offsetHeight|April|offsetLeft|blur|relative|value|calmonth|200|March|February|calmonthnav|hasOwnProperty|calhead|January|d38|cls39|d39|instanceof|cls40|nodeName|origincal|appVersion|d40|cls41|navigator|unselectable|firstChild|nextSibling|calnext|d41|calprev|indexOf|ccal|gi|tablet|innerHeight|hp|innerWidth|preselected|ontouchstart|setCibulCalendar'.split('|'),0,{}));


  // library to get program control data
  var cibulControlData = function() {

    var register,
    resource = params.controlResource,
    key,
    init = function(k, res) {

      register = {},
      key = k,
      resource = res;

    },
    get = function(uid, callback) {

      // uids are slugs for now

      if (!register[uid]) {

        remote.getJsonp(resource.replace(/\{uid\}/, uid), {data: {key: key}}, function(success, data){

          if (success) {

            if (data.code !== 200) console.log('error in fetching resource ' + resource.replace(/\{uid\}/, uid) + '?key=' + key + ' : ' + data.message);

            register[uid] = data.data;

            callback(register[uid]);
          }

        });

      } else {
        callback(register[uid]);
      }

    };

    return {
      getInstance: function(key, res) {

        if (!register)
          init(key, res);

        return {
          get: get
        };

      }
    };

  }();

  if (document.readyState === "complete")
    _run();
  else 
    addEvent(window, 'load', _run);

  return {
    controllers: _controllers
  }

})();
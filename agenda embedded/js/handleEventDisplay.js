function handleEventDisplay(eventUid, options) {

  options = extend({
    elems: { program: false, event: false},
    ctl: false,
    displayNoneClass: 'display-none',
    culture: 'en',
    cultureLabels: {
      fr: 'français',
      en: 'english',
      it: 'italiano'
    },
    selectors: {
      social: '.js_share_menu'
    },
    templates: {
      back: '<div class="event-back"><a class="url" href="#">back to list</a></div>',
      date: false,
      month: false
    },
    insertTargetClass: 'wsq',
    onHeightChange: false,
    onEventClose: false,
    onEventOpen: false,
    url: 'ajax.json?uid={uid}',
    oembedUrl: false,
    timeout: 10000,
    iconRoot: 'images/',
    labels: options.labels,
    tiles: false,
    events: {}
  }, options);

  var _run = function() {

    remote.getXmlHttp(options.url.replace('{uid}', eventUid), {timeout: options.timeout}, _displayEvent);

  },

  _displayEvent = function(responseType, data) {

    if (options.onEventOpen) options.onEventOpen();

    if (responseType == 'success') {

      addClass(options.elems.program, options.displayNoneClass);

      removeClass(options.elems.event, options.displayNoneClass);

      options.elems.event.innerHTML = data.partial;

      _createBackControl();

      if (els(options.elems.event, options.selectors.social).length) _initSocialLinks(data.control);

      if (options.onHeightChange) options.onHeightChange();

      var eventInterface = handleEvent(data.control, {
        maps: 'osm',
        targetBlankLinks: true,
        iconRoot: options.iconRoot,
        culture: options.culture,
        cultureLabels: options.cultureLabels,
        oembedUrl: options.oembedUrl,
        events: options.events,
        templates: {
          month: options.templates.month,
          date: options.templates.date
        },
        labels: options.labels,
        tiles: options.tiles
      });

      eventInterface.getHeight(function() {

        if (options.onHeightChange) options.onHeightChange();

      });

    }
  },

  _createBackControl = function() {

    var linkCanvas = document.createElement('div');
    linkCanvas.innerHTML = options.templates.back;

    var backElem = linkCanvas.childNodes[0];

    addEvent(backElem, 'click', function(e) {

      preventDefault(e);

      displayProgram(true);

    });

    getElementsByClassName(options.elems.event, options.insertTargetClass)[0].insertAdjacentElement('afterbegin', backElem);

  },

  _initSocialLinks = function(data) {

    var lang = options.culture,

    shareOptions = {
      url: data.u,
      siteUrl: '//cibul.net',
      canvas: el(options.elems.event, options.selectors.social),
      spacetime: data.st
    };

    if (typeof data.t[lang] == 'undefined') for (var l in data.t) {

      lang = l;

      break;

    }

    shareOptions.title = data.t[lang];

    shareOptions.description = data.d[lang];

    if (typeof data.i !== 'undefined') {

      shareOptions.imageUrl = data.i.replace( /^\/\//, 'https://' );

    }

    if (options.ctl.ebd && options.ctl.ebd.sh) {

      shareOptions.items = {};

      for (var i in options.ctl.ebd.sh) {

        // little fb tweak for using fb feed if appId is given
         
        if ( i == 'fb' ) {

          if ( data.fba ) {

            shareOptions.items.fb = false;
            shareOptions.fbAppId = data.fba;
            shareOptions.items.fbf = options.ctl.ebd.sh.fb?{}:false;

          } else {

            shareOptions.items.fb = options.ctl.ebd.sh.fb?{}:false; 
            shareOptions.items.fbf = false;

          }

        } else {

          shareOptions.items[i] = options.ctl.ebd.sh[i]?{}:false;

        }

      }

    }

    handleShares(shareOptions);

  },

  displayProgram = function(triggerEvent) {

    addClass(options.elems.event, options.displayNoneClass);

    removeClass(options.elems.program, options.displayNoneClass);

    if (options.onHeightChange) options.onHeightChange();
    if (options.onEventClose && triggerEvent) options.onEventClose();

    while (options.elems.event.hasChildNodes())
      options.elems.event.removeChild(options.elems.event.firstChild);

  };

  _run();

  return {
    close: displayProgram
  };

}
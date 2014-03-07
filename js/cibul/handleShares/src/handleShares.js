var handleShares = function(params) {

  params = extend({
    url: false,
    canvas: false,
    links: false,
    culture: 'fr',
    locales: { en: 'en_US', fr: 'fr_FR', it: 'it_IT', es: 'es_ES' },
    fb: { appId: '395915653831339', share: false },
    tw: true,
    gp: true
  }, params);

  var eh = sEventHandler.getInstance(), canvas,

  init = function() {

    if (!params.url) return console.log('url not set');

    if (params.canvas) {

      canvas = params.canvas;
      // items can be created right away and put in canvas

      _createItems();
      
    } else {
      // items are added on trigger to lightbox
      _createCanvas();

      _createItems();

      forEach(params.links, function(linkElem) {
        addEvent(linkElem, 'click', function(e) {
          preventDefault(e);
          _openLightbox();
        });
      });

    }

  },

  _createItems = function() {

    if (params.fb) _initFacebookLike();

    if (params.tw) _initTweet();

    if (params.gp) _initGooglePlus();

  },

  _createCanvas = function() {

    canvas = document.createElement('ul');

    _hideCanvasOnPage();

  },

  _hideCanvasOnPage = function() {

    canvas.style.display = 'none';

    el('body').insertAdjacentElement('beforeend', canvas);

  },

  _openLightbox = function() {

    canvas.style.display = 'block';

    lightbox({
      classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas'},
      elems: [canvas],
      beforeClose: function(frameElem) {
        canvas = frameElem.childNodes[0];
        _hideCanvasOnPage();
      },
      buttons: false
    });

  },

  _initFacebookLike = function() {

    if (!el('#fb-root')) {

      var fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      el('body').appendChild(fbRoot);

    }

    var html;

    if (!params.fb.share) {

      html = [
        '<span><div class="fb-like" data-href="',
        params.url,
        , '" data-send="false" data-layout="button_count" data-width="200" data-show-faces="false"></div></span>'
      ].join('');

    } else {

      html = [
        '<div class="fb-share-button" data-href="',
        params.url,
        '" data-type="button_count"></div>'
      ].join('');

    }

    _addItem(html);

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/" + params.locales[params.culture] + "/all.js#xfbml=1&appId=" + params.fb.appId;
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  },

  _initTweet = function() {

    _addItem([
      '<a href="https://twitter.com/share" class="twitter-share-button" data-lang="',
      params.culture,
      '">Tweet</a>'
    ].join(''));

   !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
  },

  _initGooglePlus = function() {

    // append share button

    _addItem(['<div class="g-plus" data-action="share" data-annotation="bubble"></div>'].join(''));

    // check if script elem is there, add it if not

    var noScript = true;
    forEach(document.getElementsByTagName('script'), function(script) {
      if (script.src == 'https://apis.google.com/js/plusone.js') return noScript = false;
    });

    if (noScript) (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();

    window.___gcfg = {
      lang: params.locales[params.culture],
      parsetags: 'onload'
    };

  },

  _addItem = function(innerHTML) {
    
    var li = document.createElement('li');
    li.innerHTML = innerHTML;
    canvas.appendChild(li);
  };

  init();

};
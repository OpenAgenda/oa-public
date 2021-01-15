var handleShares = function(params) {

  var defaults = {
    title: false,
    url: false,
    siteUrl: false,
    imageUrl: false,
    canvas: false,
    links: false,
    items: {
      fb: {
        content: '<i class="fa fa-facebook"></i>',
        className: 'fb',
        res: 'https://www.facebook.com/sharer.php',
        params: {u: 'url'}
      },
      fbf: {
        content: '<i class="fa fa-facebook"></i>',
        res: 'https://www.facebook.com/dialog/feed',
        className: 'fb',
        params: { 
          display: 'popup',
          app_id: 'fbAppId',
          link: 'url',
          redirect_uri: 'url',
          name: 'title',
          picture: 'imageUrl',
          caption: 'spacetime'
        }
      },
      tw: {
        content: '<i class="fa fa-twitter"></i>',
        className: 'tw',
        res: 'https://twitter.com/share',
        params: {url: 'url', text: 'title'}
      },
      gp: {
        content: '<i class="fa fa-google-plus"></i>',
        className: 'gp',
        res: 'https://plus.google.com/share',
        params: {url: 'url'}
      },
      li: {
        content: '<i class="fa fa-linkedin"></i>',
        className: 'li',
        res: 'http://www.linkedin.com/shareArticle',
        params: { url: 'url', title: 'title', source: 'siteUrl' }
      },
      tu: {
        content: '<i class="fa fa-tumblr"></i>',
        className: 'tb',
        res: 'http://tumblr.com/share',
        params: { s: '', v: '3', u: 'url', t: 'title' }
      },
      pi: {
        content: '<i class="fa fa-pinterest"></i>',
        className: 'pt',
        res: 'http://pinterest.com/pin/create/button/',
        params: { url: 'url', media: 'imageUrl', description: 'description' }
      }
    }
  };

  if (params.items)
    for (var i in defaults.items) params.items[i] = params.items[i]===false?false:extend(defaults.items[i], params.items[i]);
  else
    params.items = defaults.items;

  params = extend(defaults, params);

  var canvas,

  init = function() {

    if (!params.url) return console.log('url not set');
    if (!params.title) return console.log('title not set');

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

    for (var i in params.items) {
      if (params.items[i]) _createItem(params.items[i]);
    }

  },

  _createItem = function(item) {

    var url = item.res + '?';

    var reqParams = [];

    for (var i in item.params) {
      if (typeof params[item.params[i]] !== 'undefined') {
        reqParams.push(i + '=' + encodeURIComponent(params[item.params[i]]));
      } else {
        reqParams.push(i + '=' + encodeURIComponent(item.params[i]));
      }
    }

    url += reqParams.join('&');

    var html = '<a href="' + url + '" target="_blank" class="' + item.className + '">' + item.content + '</a>';

    _addItem(html);

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

  _addItem = function(innerHTML) {
    
    var li = document.createElement('li');
    li.innerHTML = innerHTML;
    canvas.appendChild(li);
  };

  init();

};
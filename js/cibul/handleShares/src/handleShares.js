var handleShares = function(params) {

  params = extend({
    title: false,
    url: false,
    siteUrl: false,
    imageUrl: false,
    canvas: false,
    links: false,
    fb: true,
    tw: true,
    gp: true,
    li: true,
    tu: true,
    pi: true
  }, params);

  var canvas,

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

    if (params.fb) _initFacebook();

    if (params.tw) _initTweet();

    if (params.gp) _initGooglePlus();

    if (params.li) _initLinkedIn();

    if (params.tu) _initTumblr();

    if (params.pi) _initPinterest();

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

  _initFacebook = function() {

    var html = [
      '<a class="fb" href="',
      'https://www.facebook.com/sharer.php?u=',
      params.url,
      '" target="_blank"><i class="icon-facebook"></i></a>'
    ].join('');

    _addItem(html);

  },

  _initTweet = function() {

    var html = ['<a class="tw" href="https://twitter.com/share?url=', encodeURIComponent(params.url)];

    if (params.title) html.push('&title=' + encodeURIComponent(params.title));

    html.push('" target="_blank"><i class="icon-twitter"></i></a>');

    _addItem(html.join(''));

  },

  _initGooglePlus = function() {
    
    _addItem(['<a class="gp" href="https://plus.google.com/share?url=', encodeURIComponent(params.url) ,'" target="_blank"><i class="icon-google-plus"></i></a>'].join(''));

  },

  _initLinkedIn = function() {

    var html = ['<a class="li" href="http://www.linkedin.com/shareArticle?url=', encodeURIComponent(params.url)];

    if (params.title) html.push('&title=' + encodeURIComponent(params.title));

    if (params.siteUrl) html.push('&source=' + encodeURIComponent(params.siteUrl));

    html.push('" target="_blank"><i class="icon-linkedin"></i></a>');

    _addItem(html.join(''));

  },

  _initTumblr = function() {

    var html = ['<a class="tb" href="http://tumblr.com/share?s=&v=3&u=', encodeURIComponent(params.url)];

    if (params.title) html.push('&t=' + encodeURIComponent(params.title));

    html.push('" target="_blank"><i class="icon-tumblr"></i></a>');

    _addItem(html.join(''));
    
  },

  _initPinterest = function() {

    if (!params.imageUrl) return;

    var html = [
      '<a class="pt" href="http://pinterest.com/pin/create/button/?url=', encodeURIComponent(params.url),
      '&media=', encodeURIComponent(params.imageUrl)
    ];

    if (params.description) html.push('&description=' + params.description);

    html.push('" target="_blank"><i class="icon-pinterest"></i></a>');

    _addItem(html.join(''));

  },

  _addItem = function(innerHTML) {
    
    var li = document.createElement('li');
    li.innerHTML = innerHTML;
    canvas.appendChild(li);
  };

  init();

};
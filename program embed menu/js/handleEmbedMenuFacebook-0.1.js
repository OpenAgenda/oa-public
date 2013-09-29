var runFacebookEmbedBehavior = function(params) {

  var content = [
    '<div class="', params.canvasClass, '">',
    '<h2>', params.title , '</h2>',
    '<p>', params.subtitle, '</p>'
  ];

  forEach(params.selection, function(link) {
    content.push('<a class="url" href="' + link.link + '">' + link.label + '</a>');
  });

  content.push('</div>');

  addEvent(params.linkElem, 'click', function(e) {

    lightbox({
      html: content.join(''),
      classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas' },
      buttons: false
    });

  });

  addClass(params.linkElem, 'url');

};
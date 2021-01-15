var handleOEmbed = function(options) {

	var options = extend({
		elements: {link: false, embed: false},
		jqueryUrl: '//code.jquery.com/jquery-1.9.1.min.js',
		oembedUrl: 'js/jquery.oembed.min.js',
    heightChange: 'heightchange',
		linkClasses: 'url',
    embedTypes: ['youtu.be', 'youtube.com', 'vimeo.com', 'soundcloud.com', 'flickr.com/photos', 'photobucket.', 'bandcamp.', 'dailymotion.com'],
    targetBlankLinks: false // add a target blank attribute on links
	}, options),
  
  onReadySent = false,

	_run = function() {

		setLinksElems(options.elements.embed.concat(options.elements.link), { className: options.linkClasses, target: options.targetBlankLinks });

    // convert links which are images
    forEach(options.elements.embed.concat(options.elements.link), function(elems) {
      forEach(els(elems, 'a'), function(linkElem) {
        linkToImage(linkElem, {onComplete: function(){
          sEventHandler.getInstance().trigger(options.heightChange);
        }});
      });
    });

		if (_hasEmbeddableLinks(options.elements.embed)) _loadOembedLib(function(){

      var elemsToEmbed = [];

			_forEachLink(options.elements.embed, function(linkElem) {

        var type = _getEmbedType(linkElem);

        if (type) {
          elemsToEmbed.push(linkElem);
        }

      });

      if (!elemsToEmbed.length) {

        if (options.heightChange) sEventHandler.getInstance().trigger(options.heightChange);

        return;
      }

      var remaining = elemsToEmbed.length;

      $(elemsToEmbed).oembed(null, {
        embedMethod: 'replace',
        beforeEmbed: function(data) {

          remaining--;

          var type = _getEmbedType($(this).get(0));

          if (!type) return true;

          return _beforeEmbedProcess(type, $(this).get(0), data);

        },
        onProviderNotFound: function() {
          remaining --;
        },
        afterEmbed: function() {

          if (!remaining && options.heightChange) {
            sEventHandler.getInstance().trigger(options.heightChange);
          }

        }
      });

      if (options.heightChange) sEventHandler.getInstance().trigger(options.heightChange);

      addEvent(window, 'resize', _resizeFrames);

    });
    else {
      if (options.heightChange) sEventHandler.getInstance().trigger(options.heightChange);
    }

	},

  _resizeFrames = function() {

    var frameElems = [];

    forEach(options.elements.embed, function(canvasElem) {

      if (!canvasElem.prevOffsetWidth) canvasElem.prevOffsetWidth = 0;

      if (canvasElem.prevOffsetWidth == canvasElem.offsetWidth) return;

      forEach(canvasElem.getElementsByTagName('iframe'), function(iframeElem) {

        iframeElem.style.width = canvasElem.offsetWidth + 'px';

      });

      canvasElem.prevOffsetWidth = canvasElem.offsetWidth;

    });

  },
  
  _getEmbedType = function(linkElem) {

    var regex = new RegExp(options.embedTypes.join('|'), 'g'),
    
    matches = linkElem.href.match(regex);

    if (!matches) return false;

    return matches[0];

  },
  
  _beforeEmbedProcess = function(type, item, data) {

    switch (type) {

      case 'youtube.com':
      case 'youtu.be':

        // avoid weird overlaps with lightboxes
        if (data.code.indexOf('?wmode=opaque') < 0) data.code += '?wmode=opaque';

        data.code = data.code.replace(/(width=")[0-9]+"?/,'width="' + $(item).parent().width() + '"');

        $(item).replaceWith(data.code);

        return false;
      
      case 'vimeo.com':

        data.code = data.code.replace(/(width=")[0-9]+"?/,'width="' + $(item).parent().width() + '"');
        data.code = data.code.replace(/(height=")[0-9]+"?/, 'height="' + Math.ceil($(item).parent().width()*3/4) + '"');

        $(item).replaceWith(data.code);

        return false;

      case 'soundcloud.com':

        var wmode = "transparent";
    
        if (data.code !== null) {
          if (data.code.indexOf("wmode") < 0) {
            data.code = data.code.replace("<embed ", "<param name=\"wmode\" value=\"" + wmode + "\"></param>\n<embed ");
            data.code = data.code.replace("<embed ", "<embed wmode=\"" + wmode + "\"");
          }
        }

        data.code = data.code.replace(/<span>([\s\S]*)<\/span>/,"");
        data.code = data.code.replace(/(width=")[0-9]+"?/,'width="' + $(item).parent().width() + '"');

        $(item).replaceWith(data.code);

        return false;

      case 'flickr.com/photos':

        data.code = data.code.replace(/<img src="/,'<img width="' + $(item).parent().width() + '" src="');

        $(item).replaceWith(data.code);

        return false;

      case 'bandcamp.':

        $(item).replaceWith(data.code.replace(/(width=")[0-9]+"?/,'width="' + $(item).parent().width() + '"'));

        return false;

    }

    return true;

  },
	
  _hasEmbeddableLinks = function(elements) {

		var has = false,
    
    regex = new RegExp(options.embedTypes.join('|'), 'g');

		forEach(elements, function(element){

			if (element.innerHTML.match(regex)) {
				has = true;
				return;
			}

		});

		return has;

	},
  
  _forEachLink = function(elements, callback) {
    
    forEach(elements, function(element) {

      forEach(element.getElementsByTagName('a'), callback);

    });

  },
	
  _loadOembedLib = function(callback) {

    var done = false;

		var loadOEmbed = function() {
      if (done) return;
			loadJs(options.oembedUrl, callback);
      done = true;
		};

    if (typeof $ == 'undefined')
      loadJs(options.jqueryUrl, loadOEmbed);
    else
      loadOEmbed();
	};

  _run();

};
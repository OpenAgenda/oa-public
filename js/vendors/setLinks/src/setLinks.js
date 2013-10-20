function setLinks(inputText, options) {

  if (!options) options = {};

  // options: classes and targetBlank
  var target = options.target?' target="' + options.target + '"':'',
    className = options.className?[' class="', options.className, '"'].join(''):'',
    patterns = {
      http: /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
      www: /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
      mailto: /([\.\w]+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim
    };

  return inputText
    .replace(/\u200B/g, "")
    //URLs starting with http://, https://, or ftp://  
    .replace(patterns.http, function($0,$1){ 
      return $1?$0:['<a', className, ' href="', $0, '"', target, '>', $0, '</a>'].join('') 
    })
    //URLS starting with www and not the above
    .replace(patterns.www, function($0,$1){ 
      return $1?$0:['<a', className, ' href="http://', $0, '"', target, '>', $0,'</a>'].join('');
    })
    //Change email addresses to mailto:: links
    .replace(patterns.mailto, function($0) {
      return ['<a', className, ' href="mailto:', $0, '">', $0, '</a>'].join('');
    });
};

function setLinksElems(elems, options) {

  if (typeof elems.nodeType != 'undefined') elems = [elems];

  for (var i in elems)
    if (typeof elems[i].nodeType !== 'undefined') 
      elems[i].innerHTML = setLinks(elems[i].innerHTML, options);
    
};
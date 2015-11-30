module.exports = function() {

  return {
    nl2br: nl2br,
    escape: escape,
    setLinks: setLinks,
    linkedText: linkedText
  };

};

function linkedText( __, data, useLinks ) {

  var mappedLabels = {}, k;

  for( k in data.values ) {

    if ( useLinks ) {

      mappedLabels[ k ] = `<a href="${data.values[k].link}">${data.values[k].label}</a>`;

    } else {

      mappedLabels[ k ] = data.values[ k ].label;

    }

  }

  return __( escape( data.text ), mappedLabels );

}


/**
 * from php.js
 */

function nl2br( str, is_xhtml ) {

  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');

}


/**
 * from ejs lib
 */

function escape( html ) {

  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

};


/**
 * from setLinks
 */

function setLinks( inputText, options ) {

  if (!options) options = {};

  // options: classes and targetBlank
  var target = options.target?' target="' + options.target + '"':'',
    className = options.className?[' class="', options.className, '"'].join(''):'',
    patterns = {
      http: /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
      www: /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
      mailto: /([\.\w\-]+@[a-zA-Z\-]+?\.[a-zA-Z]{2,6})/gim
    };

  return inputText
    .replace(/\u200B/g, "")
    //URLs starting with http://, https://, or ftp://  
    .replace(patterns.http, function($0,$1){
      return $1?$0:['<a', className, ' href="', $0, '"', target, '>', $0, '</a>'].join('');
    })
    //URLS starting with www and not the above
    .replace(patterns.www, function($0,$1){
      return $1?$0:['<a', className, ' href="http://', $0, '"', target, '>', $0,'</a>'].join('');
    })
    //Change email addresses to mailto:: links
    .replace(patterns.mailto, function($0) {
      return ['<a', className, ' href="mailto:', $0, '">', $0, '</a>'].join('');
    });
}

function setLinksElems(elems, options) {

  if (typeof elems.nodeType != 'undefined') elems = [elems];

  for (var i in elems)
    if (typeof elems[i].nodeType !== 'undefined')
      elems[i].innerHTML = setLinks(elems[i].innerHTML, options);
    
}

function extractLinks( inputText ) {

  var patterns = [
    /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
    /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
    /([\.\w\-]+@[a-zA-Z\-]+?\.[a-zA-Z]{2,6})/gim
  ];

  var matches = [];

  for ( var i in patterns ) {

    var match = inputText.match( patterns[i] );

    if ( match ) {

      for (var j = 0; j < match.length; j++) {
        
        if ( matches.indexOf( match[j] ) == -1 ) matches.push( match[j] );

      };

    }

  }

  return matches;

}
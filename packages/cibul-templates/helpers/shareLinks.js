var defaults = {
  title: false,
  url: false,
  siteUrl: false,
  imageUrl: false,
  canvas: false,
  links: false,
  services: {
    fb: {
      content: '<i class="fa fa-facebook"></i><span>facebook</span>',
      className: 'fb',
      res: 'https://www.facebook.com/sharer.php',
      params: { u: 'url' }
    },
    tw: {
      content: '<i class="fa fa-twitter"></i><span>twitter</span>',
      className: 'tw',
      res: 'https://twitter.com/share',
      params: { url: 'url', text: 'title' }
    },
    gp: {
      content: '<i class="fa fa-google-plus"></i><span>google plus</span>',
      className: 'gp',
      res: 'https://plus.google.com/share',
      params: { url: 'url' }
    },
    li: {
      content: '<i class="fa fa-linkedin"></i><span>linkedin</span>',
      className: 'li',
      res: 'http://www.linkedin.com/shareArticle',
      params: { url: 'url', title: 'title', source: 'siteUrl' }
    },
    tu: {
      content: '<i class="fa fa-tumblr"></i><span>tumblr</span>',
      className: 'tb',
      res: 'http://tumblr.com/share',
      params: { s: '', v: '3', u: 'url', t: 'title' }
    },
    pi: {
      content: '<i class="fa fa-pinterest"></i><span>pinterest</span>',
      className: 'pt',
      res: 'http://pinterest.com/pin/create/button/',
      params: { url: 'url', media: 'imageUrl', description: 'description' }
    }
  }
},

cn = require( '../js/lib/common' );

module.exports = function() {

  for( var service in defaults.services ) {

    all[ service ] = renderer( service );

  }

  return all;

}

function all( options ) {

  var result = [];

  for ( var service in defaults.services ) {

    result.push( renderer( service )( options ) );

  }

  return result;

};


function renderer( service ) {

  return function( options ) {

    var params = cn.extend( {}, defaults, options ),

    item = params.services[ service ],

    url = item.res + '?',

    reqParams = [];

    for ( var i in item.params ) {

      if (typeof params[item.params[i]] !== 'undefined') {

        reqParams.push( i + '=' + encodeURIComponent(params[item.params[i]]) );

      } else {

        reqParams.push( i + '=' + encodeURIComponent(item.params[i]) );

      }

    }

    url += reqParams.join('&amp;');

    return '<a href="' + url + '" target="_blank" class="' + item.className + '">' + item.content + '</a>';

  }

}

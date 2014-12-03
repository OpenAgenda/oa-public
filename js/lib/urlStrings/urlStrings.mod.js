

var cn = require( '../common/common.mod.js' ),

getUrlParameters = exports.getUrlParameters = function( str ){

  var map = {},
  
  parts = str.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
    map[key] = decodeURIComponent(value);
  });

  return map;

},

addUrlParameters = exports.addUrlParameters = function( str, parameters ) {

  var newParameters = cn.extend( getUrlParameters( str ), parameters );

  var newString = '';

  for (var index in newParameters) {

    newString = addUrlParameter(newString, index, newParameters[index]);

  }

  if ( str.indexOf('?') !== -1 ) {

    return str.substr(0,str.indexOf('?')) + '?' + newString.substr(1);

  }
  
  return str + '?' + newString.substr(1);

},

addUrlParameter = exports.addUrlParameter = function( str, name, value ){

  if (typeof value == 'undefined') value = '';
  
  var string = name + '=' + encodeURIComponent(value);

  var result = str;

  if (result.indexOf('?') != -1) result = result + '&' + string;
  else result = result + '?' + string;

  return result;

};
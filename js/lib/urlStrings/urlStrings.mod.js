var getUrlParameters = exports.getUrlParameters = function( str ){
  var map = {};
  var parts = str.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
    map[key] = decodeURIComponent(value);
  });
  return map;
};

var addUrlParameters = exports.addUrlParameters = function( str, parameters ) {

  var newParameters = extend(getUrlParameters(str), parameters);

  var newString = '';

  for (var index in newParameters) {
    newString = addUrlParameter(newString, index, newParameters[index]);
  }

  if (str.indexOf('?') != -1) return str.substr(0,str.indexOf('?')) + '?' + newString.substr(1);
  
  return str + '?' + newString.substr(1);

};

var addUrlParameter = exports.addUrlParameter = function( str, name, value ){

  if (typeof value == 'undefined') value = '';
  
  var string = name + '=' + encodeURIComponent(value);

  var result = str;

  if (result.indexOf('?') != -1) result = result + '&' + string;
  else result = result + '?' + string;

  return result;
};
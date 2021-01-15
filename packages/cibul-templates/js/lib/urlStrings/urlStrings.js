if (!String.prototype.getUrlParameters) String.prototype.getUrlParameters = function(){
  var map = {};
  var parts = this.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
    map[key] = decodeURIComponent(value);
  });
  return map;
};

if (!String.prototype.addUrlParameters) String.prototype.addUrlParameters = function(parameters) {

  var newParameters = extend(this.getUrlParameters(), parameters);

  var newString = '';

  for (var index in newParameters) {
    newString = newString.addUrlParameter(index, newParameters[index]);
  }

  if (this.indexOf('?') != -1) return this.substr(0,this.indexOf('?')) + '?' + newString.substr(1);
  
  return this + '?' + newString.substr(1);

};

if (!String.prototype.addUrlParameter) String.prototype.addUrlParameter = function(name, value){

  if (typeof value == 'undefined') value = '';
  
  var string = name + '=' + encodeURIComponent(value);

  var result = this;

  if (result.indexOf('?') != -1) result = result + '&' + string;
  else result = result + '?' + string;

  return result;
};
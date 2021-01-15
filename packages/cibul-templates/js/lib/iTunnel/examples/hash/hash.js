var hash = {
  getParam: function(name, defaultValue, hashValue) {

    var hashParams = (hashValue?hashValue:document.location.hash).getUrlParameters();

    return (typeof hashParams[name] != 'undefined')?hashParams[name]:defaultValue;

  },
  setParam: function(name, value, hashValue) {

    if (hashValue === undefined) hashValue = false;

    var hashParams = (hashValue?hashValue:document.location.hash).getUrlParameters();

    hashParams[name] = value;

    if (hashValue !== false) {
      return hashValue.addUrlParameters(hashParams);
    }
    else {
      document.location.hash = ''.addUrlParameters(hashParams);
    }
      

  },
  getBase64Param: function(name, defaultValue, hashValue) {

    var hashParam = this.getParam(name, false, hashValue);

    return hashParam?Base64.decode(hashParam).getUrlParameters():defaultValue;

  },
  setBase64Param: function(name, value, hashValue) {

    return this.setParam(name, Base64.encode(''.addUrlParameters(value)), hashValue);

  }
};
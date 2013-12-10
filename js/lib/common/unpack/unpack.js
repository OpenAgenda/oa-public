var unpack = function(encoded) {

  console.log(encoded);

  var div = document.createElement('div'); 
  div.innerHTML = encoded; 

  var result = JSON.parse(div.innerHTML
    .replace(new RegExp(String.fromCharCode(9), 'g'), ' ')
    //.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(String.fromCharCode(29), ''));

  return result;
};
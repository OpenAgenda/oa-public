module.exports = function() {

  return {
    nl2br: nl2br
  };

};

var nl2br = function( content ) {

  return content.replace(/\n/g,"<br>");

};
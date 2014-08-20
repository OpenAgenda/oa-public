module.exports = function( ) {

  return function( image, static ) {

    if ( static ) return '//cibulstatic.s3.amazonaws.com/' + image;

    return '//cibul.s3.amazonaws.com/' + image;

  };

};
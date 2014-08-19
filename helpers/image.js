module.exports = function( ) {

  return function( image, static ) {

    if ( !static ) return '//cibulstatic.s3.amazonaws.com/' + image;

    return '/images/' + image;

  };

}
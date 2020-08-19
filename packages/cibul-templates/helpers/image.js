module.exports = function () {

  return function (image, staticFile) {

    if (image && image.match(/^(?:(?:https?|ftp):\/\/|\/\/)/)) return image;

    if (staticFile) return '//cibulstatic.s3.amazonaws.com/' + image;

    return '//cibul.s3.amazonaws.com/' + image;

  };

};

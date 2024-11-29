module.exports = function () {

  return function (image, staticFile) {

    if (image && image.match(/^(?:(?:https?|ftp):\/\/|\/\/)/)) return image;

    if (staticFile) return '//cdn.openagenda.com/static/' + image;

    return '//cibul.s3.amazonaws.com/' + image;

  };

};

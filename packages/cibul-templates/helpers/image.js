module.exports = function () {

  return function (image, staticFile) {

    if (image && image.match(/^(?:(?:https?|ftp):\/\/|\/\/)/)) return image;

    if (staticFile) return '//cdn.openagenda.com/static/' + image;

    return '//cdn.openagenda.com/main/' + image;

  };

};

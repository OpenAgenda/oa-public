module.exports = function () {

  return function (image, staticFile) {

    if (image && image.match(/^(?:(?:https?|ftp):\/\/|\/\/)/)) return image;

    if (staticFile) return '//cdn.openagenda.com/static/' + image;

    return '//02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/' + image;

  };

};

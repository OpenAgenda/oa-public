'use strict';

module.exports = function getLongDescriptionLinks(links) {
  if (!links) {
    return null;
  }
  if (!links.length) {
    return links;
  }

  const tst = links.map(link => {
    if (link.data) {
      return {
        link: link.link,
        code: link.data.html,
      };
    }

    return {
      link: link.link,
    };
  });
  return tst;
};

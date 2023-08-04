'use strict';

module.exports = function getLongDescriptionLinks(linksWithNulls) {
  const links = (linksWithNulls || []).filter(l => !!l);

  if (!links) {
    return null;
  }
  if (!links.length) {
    return links;
  }

  const tst = links.map(link => {
    if (link.data?.html) {
      return {
        link: link.link,
        code: link.data.html,
      };
    }

    return {
      link: link.link.replace(/^mailto:/, ''),
    };
  });
  return tst;
};

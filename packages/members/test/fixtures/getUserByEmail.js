'use strict';

module.exports = async email => {
  if (email === 'truc@delinterface.fr') {
    return { uid: 22 };
  }
  return null;
};

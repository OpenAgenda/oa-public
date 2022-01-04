'use strict';

module.exports = registrationArray => {
  const registration = registrationArray.map(el => {
    if (el.type === 'link') {
      return { ...el, prefix: '' };
    }
    if (el.type === 'phone') {
      return { ...el, prefix: 'tel:' };
    }
    if (el.type === 'email') {
      return { ...el, prefix: 'mailto:' };
    }
    return el;
  });

  const registrationlink = registrationArray.find(reg => reg.type === 'link');

  return { registration: registration || [], registrationUrl: registrationlink ? registrationlink.value : null };
};

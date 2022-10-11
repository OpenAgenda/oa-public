'use strict';

module.exports = function convertRegistration(registrationArray) {
  const registration = registrationArray.map(item => ({
    value: item.value,
    type: item.type,
    prefix: {
      link: '',
      phone: 'tel:',
      email: 'mailto:',
    }[item.type],
  }));

  const registrationlink = registrationArray.filter(reg => reg.type === 'link').pop();

  return { registration: registration || [], registrationUrl: registrationlink ? registrationlink.value : null };
};

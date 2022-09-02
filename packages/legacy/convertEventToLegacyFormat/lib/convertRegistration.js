'use strict';

module.exports = registrationArray => {
  const registration = registrationArray.map(item => ({
    value: item.value,
    type: item.type,
    prefix: ({
      link: '',
      phone: 'tel:',
      email: 'mailto:'
    })[item.type]
  }));

  const registrationlink = registrationArray.find(reg => reg.type === 'link');

  return { registration: registration || [], registrationUrl: registrationlink ? registrationlink.value : null };
};

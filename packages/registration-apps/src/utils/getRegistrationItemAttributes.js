import emailValidator from '@openagenda/validators/email';
import phoneValidator from '@openagenda/validators/phone';
import linkValidator from '@openagenda/validators/link';

const attributes = [{
  code: 'email',
  icon: 'fa fa-envelope',
  validate: emailValidator({ optional: false }),
}, {
  code: 'link',
  icon: 'fa fa-link',
  validate: linkValidator({ optional: false }),
}, {
  code: 'phone',
  icon: 'fa fa-phone',
  validate: phoneValidator({ optional: false }),
}];

export default function getRegistrationItemAttributes(item) {
  for (const { type, validate, icon } of attributes) {
    try {
      validate(item);
      return { type, icon };
    } catch (e) { /* */ }
  }
  return {
    type: 'error',
    icon: 'fa fa-exclamation-circle',
  };
}

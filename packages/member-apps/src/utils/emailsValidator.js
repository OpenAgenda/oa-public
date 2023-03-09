import extractEmails from './extractEmails';
import requiredEmailsError from './requiredEmailsError';

export default function emailsValidator() {
  return input => {
    const clean = extractEmails(input);

    if (!clean.length) {
      throw requiredEmailsError(input);
    }

    return clean.map(({ email }) => email).join(', ');
  };
}

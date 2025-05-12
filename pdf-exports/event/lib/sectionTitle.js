import getIntl from '../../utils/intl.js';
import messages from '../../lib/messages.js';

export default function sectionTitle(code, lang) {
  return {
    fieldType: 'text',
    value: getIntl(lang).formatMessage(messages[code]),
    bold: true,
    fontSize: '1.2em',
  };
}

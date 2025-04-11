import { useIntl } from 'react-intl';
import { Link } from '@openagenda/uikit';
import { footer as messages } from '../messages';

export default function Footer() {
  const intl = useIntl();

  return (
    <footer>
      <Link href="/">OpenAgenda</Link>
      {' · '}
      <Link href="https://doc.openagenda.com" target="_blank" rel="noopener">
        {intl.formatMessage(messages.help)}
      </Link>
      {' · '}
      <Link
        href="https://doc.openagenda.com/conditions/"
        target="_blank"
        rel="noopener"
      >
        {intl.formatMessage(messages.termsOfUse)}
      </Link>
    </footer>
  );
}

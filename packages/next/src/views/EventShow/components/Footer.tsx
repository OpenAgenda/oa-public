import { useIntl } from 'react-intl';
import { Link } from '@openagenda/uikit';
import { footer as messages } from '../messages';

export default function Footer() {
  const intl = useIntl();

  return (
    <footer>
      <Link href="/" colorScheme="primary">
        OpenAgenda
      </Link>
      {' · '}
      <Link href="https://doc.openagenda.com" isExternal colorScheme="primary">
        {intl.formatMessage(messages.help)}
      </Link>
      {' · '}
      <Link href="https://doc.openagenda.com/conditions/" colorScheme="primary">
        {intl.formatMessage(messages.termsOfUse)}
      </Link>
    </footer>
  );
}

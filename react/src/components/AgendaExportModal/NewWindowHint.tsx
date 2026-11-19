import { useIntl } from 'react-intl';
import { VisuallyHidden } from '@openagenda/uikit';
import messages from './messages';

// Said after the name of a link or button that opens a new window (RGAA 13.2).
export default function NewWindowHint(): React.JSX.Element {
  const intl = useIntl();

  return (
    <VisuallyHidden>{` ${intl.formatMessage(messages.newWindow)}`}</VisuallyHidden>
  );
}

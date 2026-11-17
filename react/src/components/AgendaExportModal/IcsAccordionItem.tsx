import { useIntl } from 'react-intl';
import { Button, chakra } from '@openagenda/uikit';
import AccordionItem from '../AccordionItem';
import messages from './messages';
import type { IcsSubmitHandler } from './types';

export default function IcsAccordionItem({
  onSubmit,
}: {
  onSubmit: IcsSubmitHandler;
}): React.JSX.Element {
  const intl = useIntl();

  return (
    <AccordionItem value="ics" title="iCal / ICS">
      <chakra.div textAlign="center">
        <Button type="submit" alignSelf="center" onClick={onSubmit}>
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </chakra.div>
    </AccordionItem>
  );
}

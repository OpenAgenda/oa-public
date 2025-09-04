import { useIntl } from 'react-intl';
import { Button, chakra } from '@openagenda/uikit';
import AccordionItem from '../AccordionItem';
import messages from './messages';

export default function IcsAccordionItem({ handleSubmit }) {
  const intl = useIntl();

  return (
    <AccordionItem value="ics" title="iCal / ICS">
      <chakra.div textAlign="center">
        <Button type="submit" alignSelf="center" onClick={handleSubmit('ics')}>
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </chakra.div>
    </AccordionItem>
  );
}

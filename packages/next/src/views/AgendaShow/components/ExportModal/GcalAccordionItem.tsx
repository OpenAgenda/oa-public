import { useIntl } from 'react-intl';
import {
  Flex,
  H4,
  Input,
  Link,
  ListItem,
  OrderedList,
} from '@openagenda/uikit';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function GcalAccordionItem({ res }) {
  const intl = useIntl();

  return (
    <AccordionItem title="Google Agenda">
      <Flex gap="4" direction="column">
        <Input
          value={res.export.ics}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <H4>{intl.formatMessage(messages.instructions)}</H4>
        <OrderedList>
          <ListItem>
            {intl.formatMessage(messages.instructionsCopyLink, {
              link: (
                <Link
                  href="https://outlook.com"
                  isExternal
                  colorScheme="primary"
                >
                  Google Calendar
                </Link>
              ),
            })}
          </ListItem>
          <ListItem>{intl.formatMessage(messages.gcalStep2)}</ListItem>
          <ListItem>{intl.formatMessage(messages.gcalStep3)}</ListItem>
        </OrderedList>
      </Flex>
    </AccordionItem>
  );
}

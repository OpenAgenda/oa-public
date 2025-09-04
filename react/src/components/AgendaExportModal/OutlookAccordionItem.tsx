import { useIntl } from 'react-intl';
import { Flex, H4, Input, Link, List } from '@openagenda/uikit';
import AccordionItem from '../AccordionItem';
import messages from './messages';

export default function OutlookAccordionItem({ res }) {
  const intl = useIntl();

  return (
    <AccordionItem value="outlook" title="Outlook">
      <Flex gap="4" direction="column">
        <Input
          value={res.export.ics}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <H4>{intl.formatMessage(messages.instructions)}</H4>
        <List.Root as="ol" ps="5">
          <List.Item>
            {intl.formatMessage(messages.instructionsCopyLink, {
              link: (
                <Link
                  href="https://outlook.com"
                  target="_blank"
                  rel="noopener nofollow"
                >
                  Outlook
                </Link>
              ),
            })}
          </List.Item>
          <List.Item>{intl.formatMessage(messages.outlookStep2)}</List.Item>
          <List.Item>{intl.formatMessage(messages.outlookStep3)}</List.Item>
          <List.Item>{intl.formatMessage(messages.outlookStep4)}</List.Item>
          <List.Item>{intl.formatMessage(messages.outlookStep5)}</List.Item>
        </List.Root>
      </Flex>
    </AccordionItem>
  );
}

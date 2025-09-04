import { useIntl } from 'react-intl';
import { Button, Link, Flex, Text } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-regular-svg-icons';
import AccordionItem from '../AccordionItem';
import messages from './messages';

export default function DownloadPDF({ agenda, event }) {
  const intl = useIntl();

  const pdfUrl = `/api/agendas/${agenda.uid}/events/${event.uid}.pdf`;
  const eventUrl = `https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`;
  const mailtoHref = `mailto:support@openagenda.com?subject=${encodeURIComponent(
    intl.formatMessage(messages.feedbackEmailSubject),
  )}&body=${encodeURIComponent(
    intl.formatMessage(messages.feedbackEmailBody, { eventUrl }),
  )}`;

  return (
    <AccordionItem
      value="pdf"
      title={(
        <>
          {intl.formatMessage(messages.downloadPDF)}
          <Tag
            bgColor="transparent"
            border="1px solid"
            borderColor="primary.500"
            color="primary.500"
            variant="solid"
            borderRadius="full"
            fontWeight="bold"
            marginLeft={2}
          >
            {intl.formatMessage(messages.new)}
          </Tag>
        </>
      )}
    >
      <Flex direction="column" align="center" gap={4}>
        <Button asChild>
          <Link
            unstyled
            href={pdfUrl}
            download
            target="_blank"
            rel="noopener nofollow"
          >
            <FaIcon icon={faFilePdf} />
            {intl.formatMessage(messages.download)}
          </Link>
        </Button>
        <Flex gap={2}>
          <Text>{intl.formatMessage(messages.feedbackQuestion)}</Text>
          <Link href={mailtoHref} color="primary.500">
            {intl.formatMessage(messages.feedbackLink)}
          </Link>
        </Flex>
      </Flex>
    </AccordionItem>
  );
}

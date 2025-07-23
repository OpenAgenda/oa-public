import { useIntl, defineMessages } from 'react-intl';
import { Button, Link, Flex, Text } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import { FaIcon } from 'icons';
import { faFilePdf } from 'icons/regular';
import AccordionItem from 'components/AccordionItem';

const pdfMessages = defineMessages({
  downloadPDF: {
    id: 'next.views.EventShow.ShareModal.downloadPDF',
    defaultMessage: 'Download PDF',
  },
  download: {
    id: 'next.views.EventShow.ShareModal.downloadButton',
    defaultMessage: 'Download',
  },
  new: {
    id: 'next.views.EventShow.ShareModal.new',
    defaultMessage: 'NEW',
  },
  feedbackQuestion: {
    id: 'next.views.EventShow.ShareModal.feedbackQuestion',
    defaultMessage: 'Do you find this export useful?',
  },
  feedbackLink: {
    id: 'next.views.EventShow.ShareModal.feedbackLink',
    defaultMessage: 'Tell us how to improve it!',
  },
  feedbackEmailSubject: {
    id: 'next.views.EventShow.ShareModal.feedbackEmailSubject',
    defaultMessage: 'Export PDF',
  },
  feedbackEmailBody: {
    id: 'next.views.EventShow.ShareModal.feedbackEmailBody',
    defaultMessage:
      "I'm testing the PDF export on the event {eventUrl} and I would like to make some suggestions: ...",
  },
});

export default function DownloadPDF({ agenda, event }) {
  const intl = useIntl();

  const pdfUrl = `/api/agendas/${agenda.uid}/events/${event.uid}.pdf`;
  const eventUrl = `https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`;
  const mailtoHref = `mailto:support@openagenda.com?subject=${encodeURIComponent(
    intl.formatMessage(pdfMessages.feedbackEmailSubject),
  )}&body=${encodeURIComponent(
    intl.formatMessage(pdfMessages.feedbackEmailBody, { eventUrl }),
  )}`;

  return (
    <AccordionItem
      value="pdf"
      title={
        <>
          {intl.formatMessage(pdfMessages.downloadPDF)}
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
            {intl.formatMessage(pdfMessages.new)}
          </Tag>
        </>
      }
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
            {intl.formatMessage(pdfMessages.download)}
          </Link>
        </Button>
        <Flex gap={2}>
          <Text>{intl.formatMessage(pdfMessages.feedbackQuestion)}</Text>
          <Link href={mailtoHref} color="primary.500">
            {intl.formatMessage(pdfMessages.feedbackLink)}
          </Link>
        </Flex>
      </Flex>
    </AccordionItem>
  );
}

import { useIntl, defineMessages } from 'react-intl';
import { Button, Link, Flex } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import { FaIcon } from 'icons';
import { faFilePdf } from 'icons/regular';
import AccordionItem from './AccordionItem';

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
});

export default function DownloadPDF({ agenda, event }) {
  const intl = useIntl();

  const pdfUrl = `/api/agendas/${agenda.uid}/events/${event.uid}.pdf`;

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
      <Flex justify="center">
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
      </Flex>
    </AccordionItem>
  );
}

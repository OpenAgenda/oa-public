import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Button, Link, Flex, Text } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileWord } from '@fortawesome/free-regular-svg-icons';
import AccordionItem from '../AccordionItem';
import type { Agenda, Event } from '../../types';
import type { DocumentFormat } from '../AgendaExportModal/types';
import messages from './messages';

// What differs between the two documents: the title, the icon, the feedback
// email, which names the export being tried, and the « new » badge, for the
// export that has just arrived.
const formats = {
  pdf: {
    title: messages.downloadPDF,
    icon: faFilePdf,
    feedbackSubject: messages.feedbackEmailSubject,
    feedbackBody: messages.feedbackEmailBody,
    isNew: false,
  },
  docx: {
    title: messages.downloadWord,
    icon: faFileWord,
    feedbackSubject: messages.feedbackEmailSubjectWord,
    feedbackBody: messages.feedbackEmailBodyWord,
    isNew: true,
  },
};

// The event as a document to print or edit: one accordion item per format.
export default function DownloadDocument({
  format,
  rootUrl,
  agenda,
  event,
  contentLocale,
}: {
  format: DocumentFormat;
  rootUrl: string;
  agenda: Agenda;
  event: Event;
  contentLocale: string;
}): React.JSX.Element {
  const intl = useIntl();
  const { title, icon, feedbackSubject, feedbackBody, isNew } = formats[format];

  // `?lang` is what the renderer picks its content and its labels with. Without
  // it the web `/api` mount falls back to the reader's own culture (or `fr`), so
  // a PDF asked for from an event displayed in one language came out in another.
  const documentUrl = useMemo(() => {
    const url = new URL(
      `/api/agendas/${agenda.uid}/events/${event.uid}.${format}`,
      rootUrl,
    );
    if (contentLocale) {
      url.searchParams.set('lang', contentLocale);
    }
    return url.toString();
  }, [format, rootUrl, agenda.uid, event.uid, contentLocale]);

  const eventUrl = `https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`;
  const mailtoHref = `mailto:support@openagenda.com?subject=${encodeURIComponent(
    intl.formatMessage(feedbackSubject),
  )}&body=${encodeURIComponent(
    intl.formatMessage(feedbackBody, { eventUrl }),
  )}`;

  return (
    <AccordionItem
      value={format}
      title={(
        <>
          {intl.formatMessage(title)}
          {isNew ? (
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
          ) : null}
        </>
      )}
    >
      <Flex direction="column" align="center" gap={4}>
        <Button asChild>
          <Link
            unstyled
            href={documentUrl}
            download
            target="_blank"
            rel="noopener nofollow"
          >
            <FaIcon icon={icon} />
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

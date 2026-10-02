import { useIntl } from 'react-intl';
import { chakra, Link, Stack } from '@openagenda/uikit';
import {
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';
import type { Agenda } from '../../types';
import messages from './messages';

// The help page the agenda settings link to as well.
const HELP_URL = 'https://doc.openagenda.com/fr/article/des-agendas-en-donnees-ouvertes-opendata-1kv0rno';

// Agendas read before rights reached the API: the licence is the same for all.
const DEFAULT_LICENSE = {
  name: 'Licence Ouverte 2.0',
  url: 'https://www.data.gouv.fr/pages/legal/licences/etalab-2.0/',
};

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} target="_blank" rel="noopener">
      {children}
    </Link>
  );
}

function InfoIcon() {
  return (
    <chakra.svg
      viewBox="0 0 24 24"
      boxSize="18px"
      flexShrink="0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </chakra.svg>
  );
}

// Licence and credits, set apart from the formats: it is something to read,
// not something to download.
export default function AboutAccordionItem({
  agenda,
  rootUrl,
  renderHost,
}: {
  agenda: Agenda;
  rootUrl: string;
  renderHost: 'local' | 'parent';
}): React.JSX.Element {
  const intl = useIntl();

  const license = agenda.rights?.license ?? DEFAULT_LICENSE;
  const publisherName = agenda.rights?.publisher.name ?? agenda.title;
  // Shown on another site, the dialog says where the agenda lives.
  const publisher = renderHost === 'parent' ? (
    <ExternalLink href={`${rootUrl}/${agenda.slug}`}>
      {publisherName}
    </ExternalLink>
  )
    : publisherName;
  return (
    <AccordionItem
      value="about"
      bg="primary.50"
      borderTopWidth="1px"
      borderColor="primary.200"
    >
      <AccordionItemTrigger px="6" color="primary.700">
        <chakra.span display="flex" alignItems="center" gap="2.5">
          <chakra.span color="primary.600" display="inline-flex">
            <InfoIcon />
          </chakra.span>
          {intl.formatMessage(messages.aboutTitle)}
        </chakra.span>
      </AccordionItemTrigger>
      <AccordionItemContent px="6">
        <Stack gap="2" fontSize="sm">
          <p>
            {intl.formatMessage(messages.aboutLicense, {
              license: license.name,
              link: (chunks) => (
                <ExternalLink href={license.url}>{chunks}</ExternalLink>
              ),
            })}
          </p>
          <p>{intl.formatMessage(messages.aboutCredit)}</p>
          <p>
            {intl.formatMessage(messages.aboutPublisher, {
              publisher,
              link: (chunks) => (
                <ExternalLink href={HELP_URL}>{chunks}</ExternalLink>
              ),
            })}
          </p>
        </Stack>
      </AccordionItemContent>
    </AccordionItem>
  );
}

import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR from 'swr';
import ky from 'ky';
import qs from 'qs';
import { Box, Bleed, Link, VStack } from '@openagenda/uikit';
import {
  AccordionRoot,
  DialogBody,
  RadioGroup,
  Radio,
} from '@openagenda/uikit/snippets';
import useLocationQuery from 'hooks/useLocationQuery';
import useUser from 'hooks/useUser';
import isUpcomingOnlyQuery from 'utils/isUpcomingOnlyQuery';
import ModalLoadingBody from 'components/ModalLoadingBody';
import SpreadsheetAccordionItem from './SpreadsheetAccordionItem';
import PdfAccordionItem from './PdfAccordionItem';
import JsonAccordionItem from './JsonAccordionItem';
import GcalAccordionItem from './GcalAccordionItem';
import OutlookAccordionItem from './OutlookAccordionItem';
import IcsAccordionItem from './IcsAccordionItem';
import RssAccordionItem from './RssAccordionItem';
import EmbedAccordionItem from './EmbedAccordionItem';
import messages from './messages';

const fetcher = (url) =>
  ky(url, {
    hooks: {
      afterResponse: [
        (_request, _options, response) => {
          if (response.status === 401) return new Response();
        },
      ],
    },
  }).json();

function completeUrls(agendaUid, query) {
  const apiQuery = {
    ...isUpcomingOnlyQuery(query)
      ? {
          relative: ['current', 'upcoming'],
        }
      : null,
    ...query,
    passed: undefined, // omit passed
  };
  const jsonLegacyQuery = {
    ...query.passed === '1'
      ? {
          relative: ['passed', 'current', 'upcoming'],
        }
      : null,
    ...query,
    passed: undefined, // omit passed
  }; // JSONv1

  const apiQueryString = qs.stringify(apiQuery, { addQueryPrefix: true });
  const jsonLegacyQueryString = qs.stringify(jsonLegacyQuery, {
    addQueryPrefix: true,
  });

  return {
    agendaExportSettings: `/agendas/${agendaUid}/settings/exports`,
    me: '/api/me',
    export: {
      jsonV1: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.json${jsonLegacyQueryString}`,
      jsonV2: `${process.env.NEXT_PUBLIC_API_ROOT}/v2/agendas/${agendaUid}/events${apiQueryString}`,
      pdf: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.pdf${apiQueryString}`,
      xlsx: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.xlsx${apiQueryString}`,
      ics: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      csv: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.csv${apiQueryString}`,
      rss: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.rss${apiQueryString}`,
      embed: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}${apiQueryString}`,
    },
  };
}

export default function Body({ dialogRef, agenda, onClose, defaultValue }) {
  const intl = useIntl();
  const query = useLocationQuery();

  const [mode, setMode] = useState('selection');
  const res = useMemo(() => {
    const usedQuery =
      mode === 'all' ? { relative: ['passed', 'current', 'upcoming'] } : query;
    return completeUrls(agenda.uid, usedQuery);
  }, [mode, agenda.uid, query]);

  const { user } = useUser();
  const { data: meData, mutate: meMutate } = useSWR<any>(res.me, fetcher);
  const { data: exportSettingsData, isLoading: exportSettingsLoading } =
    useSWR<any>(res.agendaExportSettings, fetcher);

  const publicKey = meData?.apiKey;
  const languages = exportSettingsData?.languages;
  const hasMultipleLocations = exportSettingsData?.hasMultipleLocations ?? true;
  const fields = exportSettingsData?.spreadsheetColumns;

  const handleSubmit = (type, options) => async (e) => {
    e.preventDefault();

    let exportUrl = res.export[type];

    if (user && type === 'jsonV2') {
      let key = publicKey;
      if (!key) {
        try {
          await ky('/users/me/generateApiKey?$client[publicKey]=true').json();
          const data = await meMutate();
          key = data.apiKey;
        } catch (error) {
          console.log("Can't generate api key", error);
        }
      }

      exportUrl = new URL(res.export.jsonV2);
      if (options.detailed) {
        exportUrl.searchParams.append('detailed', '1');
      } else {
        exportUrl.searchParams.delete('detailed');
      }
      exportUrl.searchParams.append('key', key);
    }

    if (type === 'spreadsheet') {
      exportUrl = new URL(
        options.format === 'xlsx' ? res.export.xlsx : res.export.csv,
      );
      if (!options.allLanguages) {
        options.selectedLanguages.map((l) =>
          exportUrl.searchParams.append('includeLanguages[]', l),
        );
      }
      if (!options.allFields) {
        options.selectedFields.map((f) =>
          exportUrl.searchParams.append('includeFields[]', f),
        );
      }
      if (options.distributedOptions) {
        options.distributedFields.map((f) =>
          exportUrl.searchParams.append('distributeOptionalFields[]', f),
        );
      }
    }

    if (type === 'pdf') {
      exportUrl = new URL(res.export.pdf);
      exportUrl.searchParams.append('lang', intl.locale);

      if (options.locationInHeader) {
        exportUrl.searchParams.append('locationInHeader', 'true');
      }
      if (options.sort?.length) {
        options.sort.forEach((s) => {
          exportUrl.searchParams.append('sort[]', s);
        });
      }
    }

    window.open(exportUrl, '_blank');
    onClose();
  };

  if (exportSettingsLoading) {
    return <ModalLoadingBody />;
  }

  return (
    <DialogBody>
      <Box alignItems="start" mb="4">
        {intl.formatMessage(messages.openDataInfo, {
          link: (chunks: React.ReactNode) => (
            <Link
              href="https://doc.openagenda.com/des-agendas-en-donnees-ouvertes-opendata"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </Link>
          ),
        })}
      </Box>
      <RadioGroup value={mode} onValueChange={(e) => setMode(e.value)}>
        <VStack gap="2" alignItems="start">
          <Radio value="all">{intl.formatMessage(messages.exportAll)}</Radio>
          <Radio value="selection">
            {intl.formatMessage(messages.exportSelection)}
          </Radio>
        </VStack>
      </RadioGroup>

      <Bleed inline="6">
        <AccordionRoot
          as="form"
          collapsible
          defaultValue={[defaultValue]}
          mt="4"
        >
          <SpreadsheetAccordionItem
            handleSubmit={handleSubmit}
            languages={languages}
            fields={fields}
          />
          <PdfAccordionItem
            handleSubmit={handleSubmit}
            hasMultipleLocations={hasMultipleLocations}
          />
          <JsonAccordionItem handleSubmit={handleSubmit} res={res} />
          <GcalAccordionItem res={res} />
          <OutlookAccordionItem res={res} />
          <IcsAccordionItem handleSubmit={handleSubmit} />
          <RssAccordionItem handleSubmit={handleSubmit} />
          <EmbedAccordionItem dialogRef={dialogRef} res={res} agenda={agenda} />
        </AccordionRoot>
      </Bleed>
    </DialogBody>
  );
}

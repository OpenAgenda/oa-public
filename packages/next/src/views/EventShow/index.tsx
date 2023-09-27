import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import useSWR from 'swr';
import { getLocaleValue } from '@openagenda/intl';
import {
  chakra,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Button,
  List,
  ListItem,
  ListIcon,
} from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/pro-regular-svg-icons';
import { faPhone } from '@fortawesome/pro-solid-svg-icons';
import Image from 'components/Image';
import keyCDNLoader from 'utils/keyCDNLoader';
import { FetchStatus } from 'config/types';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import Metas from './components/Metas';
import AgendaHeader from './components/AgendaHeader';
import AdditionalFields from './components/AdditionalFields';
import Sidebar from './components/Sidebar';
import * as additionalFieldsUtils from './utils/additionalFields';
import fetchLocale from './locales';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

const flatten = (value = {}, preferredLang = 'fr') => value[preferredLang] ?? value[Object.keys(value).shift()];

export type EventShowProps = {
  agenda: {
    uid: number
    title: string
    schema: Record<string, any>
  }
  event: {
    title: Record<string, string>
    description: Record<string, string>
    dateRange: Record<string, string>
    timings: {
      begin: string
      end: string
    }[]
    image?: {
      size?: {
        width: number
        height: number
      }
      filename: string
    }
    imageCredits?: string
    longDescription?: Record<string, string>
    keywords?: Record<string, string[]>
    createdAt: string
    updatedAt: string
    location?: {
      agendaUid: number
      name: string
      address: string
      tags?: {
        id: number
        label: string
      }[]
      description?: Record<string, string>
      access?: Record<string, string>
      image?: string
      imageCredits?: string
      website?: string
      phone?: string
      links?: string[]
    }
  },
  preload?: string[]
};

function fetcher(url) {
  return fetch(url)
    .then(
      r => {
        if (r.ok) return r.json();
        // TODO should recreate an error with data in `await r.json()` and/or status
        throw new Error('Error');
      },
    );
}

function SuggestLocationChangeButton({ agenda, event }) {
  const {
    data: {
      me,
    } = {},
    status,
  } = useSWR(
    `/api/me/agendas/${agenda.uid}?includes[]=me.member`,
    fetcher,
  );

  if (status === FetchStatus.Fetching) return null;

  const isAdminMod = me?.member && ['administrator', 'moderator'].includes(me.member.role);

  if (isAdminMod) return null;

  return (
    <Button
      as={Link}
      href={`/${agenda.slug}/locations/${event.uid}.${event.location.uid}/suggest-change`}
      variant="outline"
      alignSelf="flex-start"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
    >
      Suggérer une modification de lieu
    </Button>
  );
}

function EditLocationButton({ agenda }) {
  const {
    data: {
      me,
    } = {},
    status,
  } = useSWR(
    `/api/me/agendas/${agenda.uid}?includes[]=me.member`,
    fetcher,
  );

  if (status === FetchStatus.Fetching) return null;

  const isAdminMod = me?.member && ['administrator', 'moderator'].includes(me.member.role);

  if (!isAdminMod) return null;

  return (
    <Button
      as={Link}
      href="/"
      // leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
      variant="outline"
      // colorScheme="white"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
      position="absolute"
      top="6"
      right="6"
    >
      Éditer le lieu
    </Button>
  );
}

function EventShow({ agenda, event, preload }: EventShowProps) {
  const intl = useIntl();
  const dateFnsLocale = useDateFnsLocale();

  const hasAdditionalFields = useMemo(
    () => additionalFieldsUtils.hasAdditionalFields(agenda.schema),
    [agenda.schema],
  );

  const additionalFields = useMemo(
    () => additionalFieldsUtils.formatAdditionalFieldData(agenda.schema, event, intl.locale, dateFnsLocale),
    [agenda.schema, dateFnsLocale, event, intl.locale],
  );

  return (
    <>
      <Metas agenda={agenda} event={event} preload={preload} />

      <Box as="header" w="full" bg="#413a42" px="4" py="8">
        <Container maxW="container.lg" color="white">
          <AgendaHeader agenda={agenda} />
        </Container>
      </Box>

      <Grid
        templateAreas={{
          base: `"sidebar"
                 "event"
                 "footer"`,
          lg: `"event sidebar"
               "event footer"`,
        }}
        gridTemplateColumns={{
          base: '1fr',
          lg: '2fr minmax(300px, 1fr)',
        }}
        gridTemplateRows="auto minmax(0, 1fr)"
        rowGap="8"
        columnGap="10"
        pt="8"
        m="auto"
        maxW="container.lg"
      >
        <GridItem area="sidebar">
          <Flex direction="row" gap="8">
            <Sidebar agenda={agenda} event={event} />
          </Flex>
        </GridItem>

        <GridItem area="event" display="flex" flexDirection="column" gap="12">
          <Flex
            as="main"
            display="flex"
            direction="column"
            gap="4"
            position="relative"
            // py="4"
            py="4"
            bg="white"
            // border="1px solid"
            // borderColor="oaGray.100"
            borderRadius="sm"
          // _hover={{
          //   borderColor: 'primary.500',
          // }}
          >
            {event.title?.[intl.locale] ? (
              <Heading as="h1" fontSize="4xl" px="8">
                {event.title[intl.locale]}
              </Heading>
            ) : null}

            {event.description?.[intl.locale] ? (
              <Heading as="h1" fontSize="4xl" px="8">
                {event.description[intl.locale]}
              </Heading>
            ) : null}

            <div>
              {/* eslint-disable-next-line no-nested-ternary */}
              {event.image
                ? event.image?.size?.width && event.image?.size?.height ? (
                  <Image
                    src={process.env.NODE_ENV === 'development'
                      ? `${DEV_IMAGE_PREFIX}${event.image.filename}`
                      : `${IMAGE_PREFIX}${event.image.filename}`}
                    fallbackSrc={process.env.NODE_ENV === 'development'
                      ? `${IMAGE_PREFIX}${event.image.filename}`
                      : undefined}
                    fallbackStrategy="onError"
                    width={event.image.size.width}
                    height={event.image.size.height}
                    loader={keyCDNLoader}
                    alt=""
                    m="auto"
                    w="full"
                    priority
                  />
                ) : (
                  <Image
                    src={process.env.NODE_ENV === 'development'
                      ? `${DEV_IMAGE_PREFIX}${event.image.filename}`
                      : `${IMAGE_PREFIX}${event.image.filename}`}
                    fallbackSrc={process.env.NODE_ENV === 'development'
                      ? `${IMAGE_PREFIX}${event.image.filename}`
                      : undefined}
                    fallbackStrategy="onError"
                    fill
                    // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
                    pos="unset !important"
                    w="full !important"
                    h="auto !important"
                    loader={keyCDNLoader}
                    alt=""
                    m="auto"
                    priority
                  />
                )
                : null}

              {event.imageCredits ? (
                <Flex justify="flex-end" color="oaGray.500" px="2">
                  {event.imageCredits}
                </Flex>
              ) : null}
            </div>

            {event.longDescription?.[intl.locale] ? (
              <chakra.div
                px="8"
                sx={{
                  ul: {
                    ps: '40px',
                    mb: '10px',
                  },
                  p: {
                    mb: '10px',
                  },
                  a: {
                    color: 'primary.500',
                    _hover: {
                      color: 'primary.600',
                      textDecoration: 'underline',
                    },
                  },
                }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: event.longDescription[intl.locale] }}
              />
            ) : null}

            {event.keywords?.[intl.locale]?.length ? (
              <chakra.div px={8} color="oaGray.500">
                {intl.formatList(event.keywords[intl.locale], { style: 'narrow' })}
              </chakra.div>
            ) : null}
          </Flex>

          {/* additional fields */}
          {hasAdditionalFields ? (
            <Flex
              display="flex"
              direction="column"
              gap="4"
              position="relative"
              // mt="8"
              // py="4"
              p="8"
              bg="white"
              // border="1px solid"
              // borderColor="oaGray.100"
              borderRadius="sm"
              // _hover={{
              //   borderColor: 'primary.500',
              // }}
            >
              <AdditionalFields
                additionalFields={additionalFields}
                updatedAt={event.updatedAt !== event.createdAt ? event.updatedAt : null}
              />
            </Flex>
          ) : null}

          {/* location */}
          {event.location ? (
            <div>
              <Heading as="h2" fontSize="2xl" mb="4">À propos du lieu</Heading>
              <Flex
                display="flex"
                direction="column"
                gap="4"
                position="relative"
                // mt="8"
                // py="4"
                p="8"
                bg="white"
                // border="1px solid"
                // borderColor="oaGray.100"
                borderRadius="sm"
                // _hover={{
                //   borderColor: 'primary.500',
                // }}
              >
                {event.location.agendaUid === agenda.uid ? (
                  <EditLocationButton agenda={agenda} />
                ) : null}
                <div>
                  <chakra.div fontWeight="bold">
                    {event.location.name}
                  </chakra.div>
                  <chakra.div>
                    {event.location.address}
                  </chakra.div>
                </div>

                {event.location.tags?.length ? (
                  <div>
                    <chakra.span fontWeight="bold">
                      Tags:&nbsp;
                    </chakra.span>
                    {intl.formatList(event.location.tags.map(tag => tag.label), { style: 'narrow' })}
                  </div>
                ) : null}

                {event.location.description[intl.locale] ? (
                  <div>
                    {event.location.description[intl.locale]}
                  </div>
                ) : null}

                {event.location.access[intl.locale] ? (
                  <div>
                    <chakra.span fontWeight="bold">
                      Accés:&nbsp;
                    </chakra.span>
                    {event.location.access[intl.locale]}
                  </div>
                ) : null}

                <div>
                  {event.location.image ? (
                    <Image
                      src={process.env.NODE_ENV === 'development'
                        ? `${DEV_IMAGE_PREFIX}${event.location.image}`
                        : `${IMAGE_PREFIX}${event.location.image}`}
                      fallbackSrc={process.env.NODE_ENV === 'development'
                        ? `${IMAGE_PREFIX}${event.location.image}`
                        : undefined}
                      fallbackStrategy="onError"
                      fill
                      // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
                      pos="unset !important"
                      w="full !important"
                      h="auto !important"
                      loader={keyCDNLoader}
                      alt=""
                      m="auto"
                      priority
                    />
                  ) : null}

                  {event.location.imageCredits ? (
                    <Flex justify="flex-end" color="oaGray.500" px="2">
                      {event.location.imageCredits}
                    </Flex>
                  ) : null}
                </div>

                {event.location.website || event.location.phone ? (
                  <List spacing="2">
                    {event.location.website ? (
                      <ListItem>
                        <ListIcon as={FontAwesomeIcon} icon={faGlobe} verticalAlign="middle" />
                        <Link isExternal href={event.location.website} colorScheme="primary">
                          {event.location.website}
                        </Link>
                      </ListItem>
                    ) : null}

                    {event.location.phone ? (
                      <ListItem>
                        <ListIcon as={FontAwesomeIcon} icon={faPhone} verticalAlign="middle" />
                        <Link isExternal href={`tel:${event.location.phone}`} colorScheme="primary">
                          {event.location.phone}
                        </Link>
                      </ListItem>
                    ) : null}
                  </List>
                ) : null}

                {event.location.links?.length ? (
                  <chakra.div>
                    Plus de liens:
                    <List>
                      {event.location.links?.map(link => (
                        <ListItem key={link}>
                          <Link isExternal href={link} colorScheme="primary">
                            {link}
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </chakra.div>
                ) : null}

                <SuggestLocationChangeButton agenda={agenda} event={event} />
              </Flex>
            </div>
          ) : null}
        </GridItem>

        <GridItem area="footer">
          <Box bg="green" h="200px" w="full">
            Footer
          </Box>
        </GridItem>
      </Grid>

      <div>
        <h1>Une autre page NextJs</h1>
        <h2>L&apos;événement: {flatten(event.title)}</h2>
        <h3>L&apos;agenda: {agenda.title}</h3>
        <pre>
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
    </>
  );
}

EventShow.fetchLocale = fetchLocale;

export default EventShow;

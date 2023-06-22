import { useIntl } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';
import { chakra, Box, Container, Flex, Grid, GridItem, Heading } from '@openagenda/uikit';
import Image from 'components/Image';
import keyCDNLoader from 'utils/keyCDNLoader';
import AgendaHeader from './components/AgendaHeader';
import fetchLocale from './locales';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

const flatten = (value = {}, preferredLang = 'fr') => value[preferredLang] ?? value[Object.keys(value).shift()];

export type EventShowProps = {
  agenda: {
    title: string
  }
  event: {
    title: Record<string, string>
    description: Record<string, string>
    image?: {
      size?: {
        width: number
        height: number
      }
      filename: string
    }
    imageCredits?: string
    longDescription?: Record<string, string>
  }
};

function EventShow({ agenda, event }: EventShowProps) {
  const intl = useIntl();

  return (
    <>
      <Box as="header" w="full" bg="#413a42" px="4" py="8">
        <Container maxW="container.lg" color="white">
          <AgendaHeader agenda={agenda} />
        </Container>
      </Box>

      {/* <Flex
        maxW="container.xl"
        mx="auto"
        pt="8"
        gap={{ base: '8', lg: '24' }}
        direction={{ base: 'column', lg: 'row-reverse' }}
      >

        <Box bg="orange" h="200px" flex="2">
          Event
        </Box>
      </Flex> */}

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
        columnGap="24"
        pt="8"
        m="auto"
        maxW="container.lg"
      >
        <GridItem area="sidebar">
          <Flex direction="row" gap="8">
            <Flex
              gap="6"
              direction="column"
              w="full"
              // w={{ base: 'full', xl: '75%' }}
              // px={{ base: '4', xl: '0' }}
            >
              <Box bg="red" h="100px" w="full">
                Sidebar
              </Box>
            </Flex>
          </Flex>
        </GridItem>

        <GridItem area="event">
          <Flex
            as="main"
            display="flex"
            direction="column"
            gap="4"
            position="relative"
            // py="4"
            pt="4"
            bg="white"
            // border="1px solid"
            // borderColor="oaGray.100"
            borderRadius="sm"
          // _hover={{
          //   borderColor: 'primary.500',
          // }}
          >
            <Heading as="h1" fontSize="4xl" px="8">
              {getLocaleValue(event.title, intl.locale)}
            </Heading>
            <Box fontSize="xl" px="8">
              {getLocaleValue(event.description, intl.locale)}
            </Box>

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

            {event.longDescription ? (
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
                dangerouslySetInnerHTML={{ __html: getLocaleValue(event.longDescription, intl.locale) }}
              />
            ) : null}
          </Flex>
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

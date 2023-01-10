import qs from 'qs';
import { defineMessages, useIntl } from 'react-intl';
import {
  Heading,
  HStack,
  VStack,
  Text,
  Link,
  Box,
  Flex,
  Icon,
  Tooltip,
  Wrap,
  Button,
} from '@openagenda/uikit';
import { nl2br } from '@openagenda/react-shared';
import { faBadgeCheck } from '@fortawesome/pro-duotone-svg-icons';
import { faEnvelope, faPlus } from '@fortawesome/pro-solid-svg-icons';
// import { faShareNodes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'components/Image';
import NextChakraLink from 'components/NextChakraLink';
// import OAIcon from 'components/OAIcon';

const messages = defineMessages({
  contact: {
    id: 'next.views.AgendaShow.AgendaHeader.contact',
    defaultMessage: 'Contact',
  },
  officialAgenda: {
    id: 'next.views.AgendaShow.AgendaHeader.officialAgenda',
    defaultMessage: 'Official agenda',
  },
  addEvent: {
    id: 'next.views.AgendaShow.AgendaHeader.addEvent',
    defaultMessage: 'Add an event',
  },
});

function simpleLoader({ src }) {
  return src;
}

function getMailtoUrl(mailtoSettings) {
  if (!mailtoSettings?.enabled || !mailtoSettings.email) return null;

  return `mailto:${mailtoSettings.email}${qs.stringify({
    subject: mailtoSettings.subject,
    body: mailtoSettings.body,
  }, { addQueryPrefix: true, skipNulls: true })}`;
}

export default function AgendaHeader({ agenda }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);

  return (
    <HStack spacing="8">
      <Image
        rounded="full"
        width="140"
        height="140"
        src={agenda.image}
        fallbackSrc={isDev ? agenda.image.replace('cibuldev', 'cibul') : null}
        fallbackStrategy="onError"
        alt=""
        draggable={false}
        loader={simpleLoader}
        border="3px solid white"
        h="140px"
        fit="cover"
      />

      <VStack spacing="3" align="start">
        <Flex>
          <Heading as="h1">{agenda.title}</Heading>
          {agenda.official ? (
            <Box fontSize="4xl" lineHeight="1.2">
              <Tooltip
                label={intl.formatMessage(messages.officialAgenda)}
                placement="right"
                hasArrow
                bg="white"
                color="blackAlpha.800"
                borderRadius="base"
                arrowSize={8}
                arrowPadding={6}
              >
                <Icon
                  as={FontAwesomeIcon}
                  icon={faBadgeCheck}
                  alignSelf="start"
                  ml="4"
                  sx={{
                    '--fa-primary-color': 'white',
                    '--fa-secondary-color': 'colors.primary.500',
                    '--fa-primary-opacity': '1',
                    '--fa-secondary-opacity': '1',
                  }}
                />
              </Tooltip>
            </Box>
          ) : null}
        </Flex>

        <Text>{nl2br(agenda.description)}</Text>

        <Link href={agenda.url}>{agenda.url}</Link>

        <Wrap mt="4 !important"> {/* !important to overwrite Stack spacing */}
          <Button
            as={NextChakraLink}
            href={mailtoUrl || `/${agenda.slug}/contact`}
            leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
            variant="outline"
            colorScheme="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
              textDecoration: 'none',
            }}
          >
            {intl.formatMessage(messages.contact)}
          </Button>
          {/* <Button
            as={NextChakraLink}
            href={`/${agenda.slug}/contact`}
            leftIcon={<FontAwesomeIcon icon={faShareNodes} />}
            variant="outline"
            colorScheme="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
              textDecoration: 'none',
            }}
          >
            Exporter
          </Button>
          <Button
            as={NextChakraLink}
            href={`/${agenda.slug}/contact`}
            leftIcon={<OAIcon />}
            variant="outline"
            colorScheme="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
              textDecoration: 'none',
            }}
          >
            Agréger
          </Button> */}
          <Button
            as={NextChakraLink}
            href={`/${agenda.slug}/contribute`}
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
            colorScheme="primary"
          >
            {intl.formatMessage(messages.addEvent)}
          </Button>
        </Wrap>
      </VStack>
    </HStack>
  );
}

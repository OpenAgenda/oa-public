import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, Heading, Flex, Text, Button, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faLock } from 'icons/regular';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useMember from '../hooks/useMember';
import { useAgenda } from '../contexts/agenda';
import * as additionalFieldsUtils from '../utils/additionalFields';
import { contributorSection as messages } from '../messages';
import AdditionalFields from './AdditionalFields';

export default function ContributorSection({ contentLocale }) {
  const intl = useIntl();
  const dateFnsLocale = useDateFnsLocale();

  const agenda = useAgenda();
  const { member, me } = useMember();

  const additionalFields = useMemo(
    () =>
      member
        ? additionalFieldsUtils.formatAdditionalFieldData({
            schema: agenda.memberSchema,
            event: member,
            locale: contentLocale,
            defaultLocale: intl.locale,
            dateFnsLocale,
          })
        : null,
    [agenda.memberSchema, dateFnsLocale, member, contentLocale, intl.locale],
  );

  if (!member) {
    return null;
  }

  const isEventContributor = member && member.userUid === me?.member?.userUid;

  return (
    <div>
      <Flex justify="space-between" mb="4">
        <Heading as="h2" fontSize="2xl">
          {intl.formatMessage(messages.contributor)}
        </Heading>

        <Box display="flex" alignItems="center" color="oaGray.500">
          <FaIcon icon={faLock} size="lg" />
          <Text fontSize="xl" ml="2">
            {intl.formatMessage(messages.privateInformation)}
          </Text>
        </Box>
      </Flex>
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
        <Button
          as={Link}
          href={
            isEventContributor
              ? `/home?agendaUid=${agenda.uid}`
              : `/${agenda.slug}/admin/members?userUid=${member.userUid}`
          }
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
          {intl.formatMessage(messages.edit)}
        </Button>

        <AdditionalFields additionalFields={additionalFields} agenda={agenda} />
      </Flex>
    </div>
  );
}

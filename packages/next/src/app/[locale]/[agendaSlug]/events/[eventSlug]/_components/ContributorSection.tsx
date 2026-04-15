import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, Heading, Flex, Text, Link } from '@openagenda/uikit';
import { FaIcon } from '@/src/icons';
import { faLock } from '@/src/icons/regular';
import useDateFnsLocale from '@/src/hooks/useDateFnsLocale';
import useMember from '../_hooks/useMember';
import { useAgenda } from '../_context/agenda';
import * as additionalFieldsUtils from '../_utils/additionalFields';
import { contributorSection as messages } from '../messages';
import AdditionalFields from './AdditionalFields';
import FloatingButton from './FloatingButton';

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

  const memberIsEmpty = useMemo(
    () =>
      !additionalFields ||
      additionalFields.filter((f) => f.value !== null).length === 0,
    [additionalFields],
  );

  if (!member) {
    return null;
  }

  const isEventContributor = member?.userUid === me?.member?.userUid;

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
        <FloatingButton asChild>
          <Link
            unstyled
            href={
              isEventContributor
                ? `/home?agendaUid=${agenda.uid}`
                : `/${agenda.slug}/admin/members?userUid=${member.userUid}`
            }
          >
            {intl.formatMessage(
              isEventContributor ? messages.meEdit : messages.edit,
            )}
          </Link>
        </FloatingButton>

        {!memberIsEmpty ? (
          <AdditionalFields
            additionalFields={additionalFields}
            agenda={agenda}
          />
        ) : (
          <div>{intl.formatMessage(messages.emptyMember)}</div>
        )}
      </Flex>
    </div>
  );
}

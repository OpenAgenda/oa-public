import { useIntl } from 'react-intl';
import { Button, chakra, Flex, HStack, Tag, Text } from '@openagenda/uikit';
import roleMessages from '@openagenda/common-labels/roles';
import { transferOwnershipModal as messages } from '../../messages';

export default function MemberItem({ member, email = null, onTransfer }) {
  const intl = useIntl();

  const memberEmail = member.email || email;

  if (!member.userUid) {
    return null;
  }

  return (
    <Flex w="full" align="center" justify="space-between">
      <div>
        <HStack>
          <Text fontWeight="bold">
            {member.name ||
              member.user?.fullName ||
              intl.formatMessage(messages.nameless)}
          </Text>
          <Text color="oaGray.500">
            {intl.formatMessage(roleMessages[member.role])}
          </Text>
          {true || !member.userUid ? (
            <Tag.Root
              borderRadius="full"
              variant="outline"
              fontWeight="bold"
              size="sm"
              fontSize="sm"
              lineHeight="1"
            >
              <Tag.Label>
                {/* TODO translate */}
                Invité
              </Tag.Label>
            </Tag.Root>
          ) : null}
        </HStack>

        {memberEmail ? (
          <chakra.div color="oaGray.500">{memberEmail}</chakra.div>
        ) : null}
      </div>

      <Button
        onClick={() =>
          onTransfer({ userUid: member.userUid, email: memberEmail })
        }
        ml="4"
      >
        {intl.formatMessage(messages.transfer)}
      </Button>
    </Flex>
  );
}

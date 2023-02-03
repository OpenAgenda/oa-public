import { Fragment } from 'react';
import qs from 'qs';
import { useIntl } from 'react-intl';
import { Button, Spacer } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears } from '@fortawesome/pro-solid-svg-icons';
import NextChakraLink from 'components/NextChakraLink';
import messages from './messages';

const wordSeparator = <>&nbsp;·&nbsp;</>;

const stateToSlug = {
  '-1': 'refused',
  0: 'toBeModerated',
  1: 'readyToPublish',
  2: 'published',
};

export default function ModeratorContextBar({ agenda, states }) {
  const intl = useIntl();

  return (
    <>
      {!states.length ? intl.formatMessage(messages.empty) : (
        <>
          {intl.formatMessage(messages.events)}&nbsp;
          {states.map(({ key, eventCount }, index, arr) => (
            <Fragment key={key}>
              <NextChakraLink
                href={`/${agenda.slug}/admin/events?${qs.stringify({ 'q.state': [key] })}`}
                fontWeight="bold"
              >
                {intl.formatMessage(messages[stateToSlug[key]], { count: eventCount })}
              </NextChakraLink>
              {index < arr.length - 1 ? wordSeparator : null}
            </Fragment>
          ))}
        </>
      )}
      <Spacer />
      <Button
        as={NextChakraLink}
        href={`/${agenda.slug}/admin/events`}
        leftIcon={<FontAwesomeIcon icon={faGears} />}
        variant="outline"
        colorScheme="white"
        _hover={{
          bg: 'white',
          borderColor: 'white',
          color: 'primary.500',
          textDecoration: 'none',
        }}
      >
        {intl.formatMessage(messages.manage)}
      </Button>
    </>
  );
}

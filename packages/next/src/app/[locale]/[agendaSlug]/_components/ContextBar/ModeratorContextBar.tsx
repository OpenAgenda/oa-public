import { Fragment } from 'react';
import qs from 'qs';
import { useIntl } from 'react-intl';
import { chakra, Button, IconButton, Spacer, Link } from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears } from '@fortawesome/pro-solid-svg-icons';
import StateTag from '@/src/components/StateTag';
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
      {!states.length ? 
        intl.formatMessage(messages.empty)
       : (
        <>
          <chakra.span display={{ base: 'none', md: 'inline-flex' }}>
            {intl.formatMessage(messages.events)}&nbsp;
          </chakra.span>
          {states.map(({ key, eventCount }, index, arr) => (
            <Fragment key={key}>
              <Link
                href={`/${agenda.slug}/admin/events?${qs.stringify({ 'q.state': [key] })}`}
                color="white"
                fontWeight="bold"
                textDecorationColor="white"
              >
                <Tooltip
                  content={intl.formatMessage(messages[stateToSlug[key]], {
                    count: eventCount,
                  })}
                  showArrow
                  openDelay={0}
                  closeDelay={0}
                >
                  <chakra.span
                    display={{ base: 'inline-flex', md: 'none' }}
                    verticalAlign="middle"
                    alignItems="center"
                  >
                    <StateTag state={key} />
                    &nbsp;{intl.formatNumber(eventCount)}
                  </chakra.span>
                </Tooltip>
                <chakra.span
                  display={{ base: 'none', md: 'inline-flex' }}
                  verticalAlign="middle"
                  alignItems="center"
                >
                  <StateTag state={key} />
                  &nbsp;
                  {intl.formatMessage(messages[stateToSlug[key]], {
                    count: eventCount,
                  })}
                </chakra.span>
              </Link>
              {index < arr.length - 1 ? wordSeparator : null}
            </Fragment>
          ))}
        </>
      )}
      <Spacer />
      <Button
        asChild
        display={{ base: 'none', md: 'flex' }}
        minW="auto"
        variant="outline"
        color="white"
        _hover={{
          bg: 'white',
          borderColor: 'white',
          color: 'primary.500',
          textDecoration: 'none',
        }}
      >
        <Link unstyled href={`/${agenda.slug}/admin/events`}>
          <FontAwesomeIcon icon={faGears} />
          <chakra.span>{intl.formatMessage(messages.manage)}</chakra.span>
        </Link>
      </Button>
      <IconButton
        asChild
        aria-label={intl.formatMessage(messages.manage)}
        display={{ base: 'flex', md: 'none' }}
        variant="outline"
        color="white"
        _hover={{
          bg: 'white',
          borderColor: 'white',
          color: 'primary.500',
          textDecoration: 'none',
        }}
      >
        <Link unstyled href={`/${agenda.slug}/admin/events`}>
          <FontAwesomeIcon icon={faGears} />
        </Link>
      </IconButton>
    </>
  );
}

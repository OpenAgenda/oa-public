import { Fragment, useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { chakra, Button, IconButton, Spacer, Link, Tooltip } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import StateTag from '../StateTag';
import EventsModal from './EventsModal';
import messages from './messages';

const wordSeparator = <>&nbsp;·&nbsp;</>;

export default function ContributorContextBar({ agenda, drafts, states }) {
  const intl = useIntl();

  const isEmpty = !drafts && !states.length;

  const [modalState, setModalState] = useState(null);
  const onOpen = useCallback(state => setModalState(state), []);
  const onClose = useCallback(() => setModalState(null), []);

  const bundleStates = useMemo(() => states.reduce((bundled, { key, eventCount }) => {
    if (key === -1) {
      bundled[0].eventCount += eventCount;
    } else if (key === 0 || key === 1) {
      bundled[1].eventCount += eventCount;
    } else if (key === 2) {
      bundled[2].eventCount += eventCount;
    }
    return bundled;
  }, [{
    key: -1,
    eventCount: 0,
    slug: 'refused',
  }, {
    key: [0, 1],
    eventCount: 0,
    slug: 'inModeration',
  }, {
    key: 2,
    eventCount: 0,
    slug: 'published',
  }]).filter(s => !!s.eventCount), [states]);

  return (
    <>
      {isEmpty ? intl.formatMessage(messages.notContributed) : (
        <>
          <chakra.span display={{ base: 'none', md: 'inline-flex' }}>
            {intl.formatMessage(messages.myEvents)}
            &nbsp;
          </chakra.span>
          {drafts ? (
            <Button
              variant="link"
              colorScheme="white"
              fontWeight="bold"
              onClick={() => onOpen({ key: 'drafts', slug: 'drafts' })}
            >
              <Tooltip
                hasArrow
                label={intl.formatMessage(messages.drafts, { count: drafts })}
              >
                <chakra.span display={{ base: 'inline-flex', md: 'none' }} verticalAlign="middle" alignItems="center">
                  <StateTag state="draft" />
                  &nbsp;{intl.formatNumber(drafts)}
                </chakra.span>
              </Tooltip>
              <chakra.span display={{ base: 'none', md: 'inline-flex' }} verticalAlign="middle" alignItems="center">
                <StateTag state="draft" />
                &nbsp;{intl.formatMessage(messages.drafts, { count: drafts })}
              </chakra.span>
            </Button>
          ) : null}
          {drafts && states.length ? wordSeparator : null}
          {bundleStates.map((bundleState, index, arr) => (
            <Fragment key={bundleState.key}>
              <Button variant="link" colorScheme="white" fontWeight="bold" onClick={() => onOpen(bundleState)}>
                <Tooltip
                  hasArrow
                  label={intl.formatMessage(messages[bundleState.slug], { count: bundleState.eventCount })}
                >
                  <chakra.span display={{ base: 'inline-flex', md: 'none' }} verticalAlign="middle" alignItems="center">
                    <StateTag state={bundleState.key} />
                    &nbsp;{intl.formatNumber(bundleState.eventCount)}
                  </chakra.span>
                </Tooltip>
                <chakra.span display={{ base: 'none', md: 'inline-flex' }} verticalAlign="middle" alignItems="center">
                  <StateTag state={bundleState.key} />
                  &nbsp;{intl.formatMessage(messages[bundleState.slug], { count: bundleState.eventCount })}
                </chakra.span>
              </Button>
              {index < arr.length - 1 ? wordSeparator : null}
            </Fragment>
          ))}
        </>
      )}
      <Spacer />
      <Button
        as={Link}
        href={`/${agenda.slug}/contribute`}
        leftIcon={<FontAwesomeIcon icon={faPlus} />}
        display={{ base: 'none', md: 'flex' }}
        minW="auto"
        variant="outline"
        colorScheme="white"
        _hover={{
          bg: 'white',
          borderColor: 'white',
          color: 'primary.500',
          textDecoration: 'none',
        }}
      >
        {intl.formatMessage(messages.contribute)}
      </Button>
      <IconButton
        as={Link}
        href={`/${agenda.slug}/contribute`}
        icon={<FontAwesomeIcon icon={faPlus} />}
        aria-label={intl.formatMessage(messages.contribute)}
        display={{ base: 'flex', md: 'none' }}
        variant="outline"
        colorScheme="white"
        _hover={{
          bg: 'white',
          borderColor: 'white',
          color: 'primary.500',
          textDecoration: 'none',
        }}
      />

      {modalState !== null ? (
        <EventsModal
          isOpen
          onClose={onClose}
          agenda={agenda}
          bundleState={modalState}
        />
      ) : null}
    </>
  );
}

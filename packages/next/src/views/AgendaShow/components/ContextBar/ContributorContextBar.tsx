import { Fragment, useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Button, Spacer } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import NextChakraLink from 'components/NextChakraLink';
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
          {intl.formatMessage(messages.myEvents)}
          &nbsp;
          {drafts ? (
            <Button
              variant="link"
              colorScheme="white"
              fontWeight="bold"
              onClick={() => onOpen({ key: 'drafts', slug: 'drafts' })}
            >
              {intl.formatMessage(messages.drafts, { count: drafts })}
            </Button>
          ) : null}
          {drafts && states.length ? wordSeparator : null}
          {bundleStates.map((bundleState, index, arr) => (
            <Fragment key={bundleState.key}>
              <Button variant="link" colorScheme="white" fontWeight="bold" onClick={() => onOpen(bundleState)}>
                {intl.formatMessage(messages[bundleState.slug], { count: bundleState.eventCount })}
              </Button>
              {index < arr.length - 1 ? wordSeparator : null}
            </Fragment>
          ))}
        </>
      )}
      <Spacer />
      <Button
        as={NextChakraLink}
        href={`/${agenda.slug}/contribute`}
        locale={false}
        leftIcon={<FontAwesomeIcon icon={faPlus} />}
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

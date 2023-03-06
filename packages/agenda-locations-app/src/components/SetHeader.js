
import { MoreInfo } from '@openagenda/react-shared';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

const messages = defineMessages({
  setSubtitle: {
    id: 'AgendaLocations.setHeader.setSubtitle',
    defaultMessage: '{count, plural, =0 {nothing} one {Set of one location used in } other {Set of # locations used in }}',
  },
  setSubtitleLink: {
    id: 'AgendaLocations.setHeader.setSubtitleLink',
    defaultMessage: '{count, plural, =0 {nothing} one {one agenda} other {# agendas}}',
  },
  help: {
    id: 'AgendaLocations.setHeader.help',
    defaultMessage: 'Administrators of agendas using this set have access to all operations on the locations of the set: creation, update, deletion, merging. Operations can therefore impact all agendas of the set.',
  },
});

const SetHeader = ({ set, res }) => {
  const intl = useIntl();
  return (
    <div className="row">
      <div className="col-sm-12 margin-bottom-md">
        <h2>{set.title}</h2>
        <div>
          <FormattedMessage values={{ count: set.locationsCount }} {...messages.setSubtitle} />
          <a href={`${res.agendaSearchPage}?locationSet=${set.uid}`}>
            <FormattedMessage values={{ count: set.agendasCount }} {...messages.setSubtitleLink} />
          </a>
          <MoreInfo
            className="margin-left-sm"
            id="checkbox-help"
            content={intl.formatMessage(messages.help)}
            placement="top"
          />
        </div>
      </div>
    </div>
  );
};

export default SetHeader;

import React from 'react';
import PropTypes from 'prop-types';
import { MoreInfo } from '@openagenda/react-components';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

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
}); // from setHeader labels

const SetHeader = ({ set, res, intl }) => (
  <div className="row">
    <div className="col-sm-12 margin-bottom-md">
      <h2>{set.title}</h2>
      <div>
        <FormattedMessage values={{ count: set.locationsCount }} {...messages.setSubtitle} />
        <a href={`${res.agendaSearch}?locationSet=${set.uid}`}>
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

SetHeader.propTypes = {
  intl: PropTypes.object.isRequired,
  set: PropTypes.object.isRequired,
  res: PropTypes.object.isRequired,
};

export default injectIntl(SetHeader);

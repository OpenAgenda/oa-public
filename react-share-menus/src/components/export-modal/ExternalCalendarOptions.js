import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const ExternalCalendarOptions = ({ type, exportUrl }) => {
  const intl = useIntl();

  const messages = defineMessages({
    instructions: {
      id: 'instructions',
      defaultMessage: 'Instructions',
    },
    instructionsCopyLink: {
      id: 'instructionsCopyLink',
      defaultMessage: '1. Copy the link in the field above and open ',
    },
    gcalStep2: {
      id: 'gcalStep2',
      defaultMessage: '2. In the left section, open "Other Calendars > Add by URL".',
    },
    gcalStep3: {
      id: 'gcalStep3',
      defaultMessage: '3. Follow the instructions by pasting the link you copied in step 1',
    },
    outlookStep2: {
      id: 'outlookStep2',
      defaultMessage: '2. At the bottom of the page, select the calendar icon'
    },
    outlookStep3: {
      id: 'outlookStep3',
      defaultMessage: '3. In the navigation pane, select "Add calendar"'
    },
    outlookStep4: {
      id: 'outlookStep4',
      defaultMessage: '4. Select "Subscribe from web"'
    },
    outlookStep5: {
      id: 'outlookStep5',
      defaultMessage: '5. Paste the URL you copied in step 1. Select "Import".'
    },
  });

  const contentByType = {
    gcal: {
      link: 'https://calendar.google.com',
      linkText: 'Google Calendar',
      instructions: [messages.gcalStep2, messages.gcalStep3],
    },
    outlook: {
      link: 'https://outlook.com',
      linkText: 'Outlook',
      instructions: [messages.outlookStep2, messages.outlookStep3, messages.outlookStep4, messages.outlookStep5]
    }
  };

  const handleClick = e => e.target.select();

  return (
    <div className="margin-left-md">
      <input
        className="form-control url-input"
        value={exportUrl}
        readOnly
        onClick={handleClick}
      />
      <h4>{intl.formatMessage(messages.instructions)}</h4>
      <p>{intl.formatMessage(messages.instructionsCopyLink)}
        <a target="_blank" href={contentByType[type].link} rel="noreferrer" className="calendars-link">
          {contentByType[type].linkText}
        </a>
      </p>
      {contentByType[type].instructions.map(msg => (<p key={msg.id}>{intl.formatMessage(msg)}</p>))}
    </div>
  );
};

export default ExternalCalendarOptions;

import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  APIPresentation: {
    id: 'AgendaSettings.Components.IdentifierInformation.APIPresentation',
    defaultMessage:
      'The identifier of an agenda is useful for API calls. Here are a few examples',
  },
  APIAgendaConfigurationRoute: {
    id: 'AgendaSettings.Components.IdentifierInformation.APIAgendaConfigurationRoute',
    defaultMessage: 'See the settings and general information',
  },
  APIEventsListRoute: {
    id: 'AgendaSettings.Components.IdentifierInformation.APIEventsListRoute',
    defaultMessage: 'List the events referenced in the agenda',
  },
  APIDocumentation: {
    id: 'AgendaSettings.Components.IdentifierInformation.APIDocumentation',
    defaultMessage:
      'See all details by visiting the full documentation: {link}',
  },
  APIClickHere: {
    id: 'AgendaSettings.Components.IdentifierInformation.APIClickHere',
    defaultMessage: 'Click here',
  },
});

export default function IdentifierInformation(props) {
  const { agenda } = props;

  const intl = useIntl();

  return (
    <div className="margin-v-sm">
      <span>{intl.formatMessage(messages.APIPresentation)}:</span>
      <ul className="list-unstyled margin-top-sm">
        <li className="margin-bottom-xs">
          <b>{intl.formatMessage(messages.APIAgendaConfigurationRoute)}</b>
          <div className="info-block-sm">
            <code>
              https://api.openagenda.com/v2/agendas/<b>{agenda.uid}</b>?key=...
            </code>
          </div>
        </li>
        <li>
          <b>{intl.formatMessage(messages.APIEventsListRoute)}</b>
          <div className="info-block-sm">
            <code>
              https://api.openagenda.com/v2/agendas/<b>{agenda.uid}</b>
              /events?key=...
            </code>
          </div>
        </li>
      </ul>
      <span>
        {intl.formatMessage(messages.APIDocumentation, {
          link: (
            <a
              target="_blank"
              rel="noreferrer"
              href="https://developers.openagenda.com"
            >
              {intl.formatMessage(messages.APIClickHere)}
            </a>
          ),
        })}
      </span>
    </div>
  );
}

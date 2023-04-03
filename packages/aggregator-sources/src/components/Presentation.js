import { defineMessages } from 'react-intl';
import links from '../utils/externalLinks';

const messages = defineMessages({
  startUse: {
    id: 'aggregator-sources.Dashboard.startUse',
    defaultMessage: 'Start',
  },
  findOutMore: {
    id: 'aggregator-sources.Dashboard.findOutMore',
    defaultMessage: 'Find out more',
  },
  aggregationHeadline: {
    id: 'aggregator-sources.Dashboard.aggregationHeadline',
    defaultMessage: 'Connect source agendas and automatize event publications',
  },
  aggregationDesc: {
    id: 'aggregator-sources.Dashboard.aggregationDesc',
    defaultMessage:
      'Use the event Aggregation function to automatically resume events published on other OpenAgenda calendars. Combine up to 365 events per year with the free version!',
  },
});

export default ({ onCreate, intl }) => (
  <div className="padding-v-md">
    <div className="row padding-v-sm">
      <div className="col-sm-offset-2 col-sm-8">
        <p>
          <strong>{intl.formatMessage(messages.aggregationHeadline)}</strong>
        </p>
        <p>
          {intl.formatMessage(messages.aggregationDesc)}{' '}
          <a href={links.helpMain}>
            {intl.formatMessage(messages.findOutMore)}
          </a>
        </p>
      </div>
    </div>
    <div className="row text-center padding-v-sm">
      <img
        src={links.aggregationPresentationPic(intl.locale)}
        alt={intl.formatMessage(messages.aggregationDesc)}
      />
    </div>
    <div className="row text-center padding-top-md">
      <button type="button" onClick={onCreate} className="btn btn-primary">
        {intl.formatMessage(messages.startUse)}
      </button>
    </div>
  </div>
);

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { injectIntl } from 'react-intl';
import qs from 'qs';
import { Spinner, withLayoutData } from '@openagenda/react-shared';
import * as activitiesActions from '../../redux/modules/activities';
import { ActivityItem } from '../../components';
import messages from '../../messages/activities';

@injectIntl
@withLayoutData('agenda')
@provideHooks({
  fetch: async ({ store: { dispatch }, location, params }) => {
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const promises = [];

    // if ( !activitiesActions.isLoaded( state ) ) {
    promises.push(dispatch(activitiesActions.load(query, { slug: params.slug })));
    // }

    return Promise.all(__CLIENT__ ? [] : promises);
  }
})
@connect(
  (state, props) => {
    const locationQuery = qs.parse(props.location.search, { ignoreQueryPrefix: true });

    return {
      res: state.res,
      activitiesConfig: state.settings.activities,
      activities: state.activities.data,
      fromId: state.activities.fromId,
      loading: state.activities.loading,
      nextLoading: state.activities.nextLoading,
      lastPage: state.activities.lastPage,
      query: _.pick(locationQuery, ['actor', 'verb', 'object', 'target'])
    };
  },
  { ...activitiesActions }
)
export default class AgendaDashboard extends Component {
  static propTypes = {
    list: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    activities: PropTypes.array,
    fromId: PropTypes.number,
    loading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    lastPage: PropTypes.bool
  };

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage, agenda } = this.props;
    if (!activities || !activities.length || loading || nextLoading || lastPage) return;
    nextPage(query, activities[activities.length - 1].id, agenda);
  };

  throttledNextPage = _.throttle(this.nextPage, 400, { trailing: false });

  render() {
    const { activitiesConfig, activities, nextLoading, intl } = this.props;

    return (
      <div className="padding-top-md">
        {(activities && activities.length > 0) && <ul className="list-unstyled activity-list">
          {activities.map(a => (
            <ActivityItem
              key={'activity.' + a.id}
              activity={a}
              config={activitiesConfig}
            />
          ))}
        </ul>}

        {(!activities || activities.length === 0) && <div className="margin-bottom-sm">
          {intl.formatMessage(messages.noAgendaActivity)}
        </div>}

        {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>}

        <Waypoint onEnter={this.throttledNextPage} />
      </div>
    );

  }
};

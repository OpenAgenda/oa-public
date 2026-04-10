import throttle from 'lodash/throttle.js';
import pick from 'lodash/pick.js';
import { Component } from 'react';
import redial from 'redial';
import { connect } from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import { Waypoint } from 'react-waypoint';
import injectIntl from '@openagenda/intl/injectIntl';
import qs from 'qs';
import { Spinner } from '@openagenda/react-shared';
import activitiesReducer, * as activitiesActions from '../../redux/modules/activities.js';
import modalsReducer from '../../redux/modules/modals.js';
import { ActivityItem } from '../../components/index.js';
import messages from '../../messages/activities.js';

class UserDashboard extends Component {
  constructor(props) {
    super(props);
    this.nextPage = this.nextPage.bind(this);
    this.throttledNextPage = throttle(this.nextPage, 400, {
      trailing: false,
    });
  }

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if (!activities || !activities.length || loading || nextLoading || lastPage) return;
    nextPage(query, activities[activities.length - 1].id);
  };

  render() {
    const { intl, activitiesConfig, activities, nextLoading } = this.props;

    return (
      <div className="content">
        <h2 className="margin-bottom-md">
          {intl.formatMessage(messages.history)}
        </h2>

        {activities && activities.length > 0 && (
          <ul className="list-unstyled activity-list">
            {activities.map((a) => (
              <ActivityItem
                key={`activity.${a.id}`}
                activity={a}
                config={activitiesConfig}
              />
            ))}
          </ul>
        )}

        {(!activities || activities.length === 0) && (
          <div className="margin-bottom-sm">
            {intl.formatMessage(messages.noUserActivity)}
          </div>
        )}

        {nextLoading && (
          <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>
        )}

        <Waypoint onEnter={this.throttledNextPage} />
      </div>
    );
  }
}

export default injectIntl(
  redial.provideHooks({
    inject: ({ store }) =>
      store.inject({
        form: formReducer,
        modals: modalsReducer,
        activities: activitiesReducer,
      }),
    fetch: async ({ store: { dispatch, getState }, location }) => {
      const state = getState();
      const query = qs.parse(location.search, { ignoreQueryPrefix: true });
      const promises = [];

      if (!activitiesActions.isLoaded(state)) {
        promises.push(dispatch(activitiesActions.load(query)));
      }

      return Promise.all(typeof window !== 'undefined' ? [] : promises);
    },
  })(
    connect(
      (state, props) => {
        const locationQuery = qs.parse(props.location.search, {
          ignoreQueryPrefix: true,
        });

        return {
          res: state.res,
          activitiesConfig: state.settings.activities,
          activities: state.activities.data,
          fromId: state.activities.fromId,
          loading: state.activities.loading,
          nextLoading: state.activities.nextLoading,
          lastPage: state.activities.lastPage,
          query: pick(locationQuery, ['actor', 'verb', 'object', 'target']),
        };
      },
      { ...activitiesActions },
    )(UserDashboard),
  ),
);

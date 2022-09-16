import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import { Waypoint } from 'react-waypoint';
import qs from 'qs';
import { Spinner } from '@openagenda/react-shared';
import activitiesReducer, * as activitiesActions from '../../redux/modules/activities';
import modalsReducer from '../../redux/modules/modals';
import { ActivityItem } from '../../components';
import I18nContext from '../../contexts/I18nContext';

@provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer,
    modals: modalsReducer,
    activities: activitiesReducer
  }),
  fetch: async ({ store: { dispatch, getState }, location }) => {
    const state = getState();
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const promises = [];

    if (!activitiesActions.isLoaded(state)) {
      promises.push(dispatch(activitiesActions.load(query)));
    }

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
export default class UserDashboard extends Component {

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

  static contextType = I18nContext;

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if (!activities || !activities.length || loading || nextLoading || lastPage) return;
    nextPage(query, activities[activities.length - 1].id);
  };

  throttledNextPage = _.throttle(this.nextPage, 400, { trailing: false });

  render() {
    const { activitiesConfig, activities, nextLoading } = this.props;
    const { getLabel } = this.context;

    return (
      <div className="content">
        <h2 className="margin-bottom-md">{getLabel('activities')}</h2>

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
          {getLabel('noActivity')}
        </div>}

        {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>}

        <Waypoint onEnter={this.throttledNextPage} />
      </div>
    );

  }

};

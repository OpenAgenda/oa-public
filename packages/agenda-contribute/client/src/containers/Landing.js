import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Spinner } from '@openagenda/react-shared';
import reducers from '../reducers';

class Landing extends Component {
  componentDidMount() {
    const {
      onDisplay,
      history
    } = this.props;

    onDisplay(history);
  }

  render() {
    return (
      <div
        className="text-center margin-top-lg"
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Spinner mode="inline" options={{ scale: 1, width: 1 }} />
      </div>
    );
  }
}

// container bit
export default connect(
  () => ({}),
  dispatch => ({
    onDisplay: history => dispatch(reducers.landing.evaluate(history))
  })
)(withRouter(Landing));

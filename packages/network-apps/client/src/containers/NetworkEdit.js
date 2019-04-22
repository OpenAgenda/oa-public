import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import reducers from '../reducers';

class NetworkEdit extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, schema } = this.props.network;

    if ( !network ) return <p>ça charge</p>

    return <div className="wsq">
      <h1>{network.title}</h1>
    </div>

  }

}

export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.network.load() )
  } )
)( NetworkEdit );

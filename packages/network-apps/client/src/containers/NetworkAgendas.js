import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import reducers from '../reducers';

import Loading from '../components/Loading';
import NetworkHeader from '../components/NetworkHeader';

class NetworkAgendas extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, agendas } = this.props.network;

    if ( !agendas ) return <Loading />;

    return <div>
      {network ? <NetworkHeader network={network} /> : null }
      {agendas ? <ul className="list-unstyled">{agendas.map( a => (
        <li className="margin-v-sm padding-all-sm wsq" key={'agenda' + a.uid}>
          <label>{a.title}</label>
        </li>
      ) )}</ul> : <Loading /> }
    </div>

  }

}

export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.network.loadAgendas() )
  } )
)( NetworkAgendas );

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import reducers from '../reducers';

import AddAgenda from '../components/AddAgenda';
import Loading from '../components/Loading';
import Header from '../components/Header';
import NetworkHeader from '../components/NetworkHeader';

class NetworkAgendas extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, agendas, add } = this.props.network;

    const { onAdd, onAddClose, onAddSubmit } = this.props;

    return <div>
      <Header {...this.props} />
      { agendas ? <div>
        { network ? <NetworkHeader network={network} /> : null }
        <button className="btn btn-primary" onClick={onAdd}>Ajouter un agenda au réseau</button>
        {agendas ? <ul className="list-unstyled">{agendas.map( a => (
          <li className="margin-v-sm padding-all-sm wsq" key={'agenda' + a.uid}>
            <label>{a.title}</label>
          </li>
        ) )}</ul> : <Loading /> }
        { add ? <AddAgenda onAdd={onAddSubmit} onClose={onAddClose} /> : null }
      </div> : <Loading /> }
    </div>

  }

}

export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.network.loadAgendas() ),
    onAdd: () => dispatch( reducers.network.showAddAgenda() ),
    onAddSubmit: slugOrUrl => dispatch( reducers.network.submitAddAgenda( slugOrUrl ) ),
    onAddClose: () => dispatch( reducers.network.closeAddAgenda() )
  } )
)( NetworkAgendas );

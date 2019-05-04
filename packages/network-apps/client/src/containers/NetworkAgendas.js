import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import reducers from '../reducers';

import AddAgenda from '../components/AddAgenda';
import Canvas from '../components/Canvas';
import ListHead from '../components/ListHead';
import Loading from '../components/Loading';


class NetworkAgendas extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, agendas, add } = this.props.network;

    const { onAdd, onAddClose, onAddSubmit } = this.props;

    return <Canvas {...this.props}>
      <ListHead className="text-center">
          <button className="btn btn-primary" onClick={onAdd}>Ajouter un agenda au réseau</button>
      </ListHead>
      <div>
        {agendas ? <ul className="list-unstyled">{agendas.map( a => (
          <li className="margin-v-sm padding-all-sm wsq" key={'agenda' + a.uid}>
            <label>{a.title}</label>
            <ul className="list-inline">
              <li><a target="_blank" href={`/agendas/${a.uid}`}>Voir</a></li>
            </ul>
          </li>
        ) )}</ul> : <Loading /> }
        { add ? <AddAgenda onAdd={onAddSubmit} onClose={onAddClose} /> : null }
      </div>
    </Canvas>

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

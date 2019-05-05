import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import reducers from '../reducers';

import AddAgenda from '../components/AddAgenda';
import CreateAgenda from '../components/CreateAgenda';
import Canvas from '../components/Canvas';
import ListHead from '../components/ListHead';
import Loading from '../components/Loading';


class NetworkAgendas extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, agendas, add, create } = this.props.network;

    const { onAdd, onAddClose, onAddSubmit, onCreate, onCreateClose, onCreateSubmit } = this.props;

    return <Canvas {...this.props}>
      <ListHead className="text-center">
          <button className="btn btn-primary margin-h-sm" onClick={onCreate}>Créer un agenda</button>
          <button className="btn btn-default margin-h-sm" onClick={onAdd}>Ajouter un agenda existant</button>
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
        { add ? <AddAgenda
          onAdd={onAddSubmit}
          onClose={onAddClose}
        /> : null }
        { create ? <CreateAgenda
          onCreate={onCreateSubmit}
          onClose={onCreateClose}
        /> : null }
      </div>
    </Canvas>

  }

}

export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.network.loadAgendas() ),
    onAdd: () => dispatch( reducers.network.showAddAgenda() ),
    onCreate: () => dispatch( reducers.network.showCreateAgenda() ),
    onAddSubmit: slugOrUrl => dispatch( reducers.network.submitAddAgenda( slugOrUrl ) ),
    onCreateSubmit: agenda => dispatch( reducers.network.submitCreateAgenda( agenda ) ),
    onAddClose: () => dispatch( reducers.network.closeAddAgenda() ),
    onCreateClose: () => dispatch( reducers.network.closeCreateAgenda() )
  } )
)( NetworkAgendas );

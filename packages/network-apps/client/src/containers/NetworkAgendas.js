import { Component } from 'react';
import { connect } from 'react-redux';

import * as reducers from '../reducers/index.js';

import AddAgenda from '../components/AddAgenda.js';
import CreateAgenda from '../components/CreateAgenda.js';
import RemoveAgenda from '../components/RemoveAgenda.js';
import Canvas from '../components/Canvas.js';
import ListHead from '../components/ListHead.js';
import Loading from '../components/Loading.js';

export class NetworkAgendasComponent extends Component {
  componentDidMount() {
    const { onMount } = this.props;

    onMount();
  }

  render() {
    const {
      network: { agendas, add, create, remove, credentialsSchema },
    } = this.props;

    const {
      onAdd,
      onAddClose,
      onAddSubmit,
      onCreate,
      onCreateClose,
      onCreateSubmit,
      onRemove,
      onRemoveSubmit,
      onRemoveClose,
    } = this.props;

    return (
      <Canvas {...this.props}>
        <ListHead className="text-center">
          <button
            type="button"
            className="btn btn-primary margin-h-sm"
            onClick={onCreate}
          >
            Créer un agenda
          </button>
          <button
            type="button"
            className="btn btn-default margin-h-sm"
            onClick={onAdd}
          >
            Ajouter un agenda existant
          </button>
        </ListHead>
        <div>
          {agendas ? (
            <ul className="list-unstyled">
              {agendas.map((a) => (
                <li
                  className="margin-v-sm padding-h-sm padding-top-sm wsq"
                  key={`agenda${a.uid}`}
                >
                  <strong>{a.title}</strong>
                  <ul className="list-inline">
                    <li>
                      <a
                        target="_blank"
                        href={`/agendas/${a.uid}`}
                        rel="noreferrer"
                      >
                        Voir
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={onRemove.bind(null, a)}
                      >
                        Retirer
                      </button>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <Loading />
          )}
          {add ? (
            <AddAgenda
              credentialsSchema={credentialsSchema}
              onAdd={onAddSubmit}
              onClose={onAddClose}
            />
          ) : null}
          {remove ? (
            <RemoveAgenda
              onRemove={() => onRemoveSubmit(remove)}
              onClose={onRemoveClose}
            />
          ) : null}
          {create ? (
            <CreateAgenda onCreate={onCreateSubmit} onClose={onCreateClose} />
          ) : null}
        </div>
      </Canvas>
    );
  }
}

const NetworkAgendas = connect(
  (state) => state,
  (dispatch) => ({
    onMount: () => dispatch(reducers.network.loadAgendas()),
    onAdd: () => dispatch(reducers.network.showAddAgenda()),
    onCreate: () => dispatch(reducers.network.showCreateAgenda()),
    onAddSubmit: (slugOrUrl, features) =>
      dispatch(reducers.network.submitAddAgenda(slugOrUrl, features)),
    onCreateSubmit: (agenda) =>
      dispatch(reducers.network.submitCreateAgenda(agenda)),
    onAddClose: () => dispatch(reducers.network.closeAddAgenda()),
    onCreateClose: () => dispatch(reducers.network.closeCreateAgenda()),
    onRemove: (agenda) => dispatch(reducers.network.showRemoveAgenda(agenda)),
    onRemoveSubmit: (agenda) =>
      dispatch(reducers.network.submitRemoveAgenda(agenda)),
    onRemoveClose: () => dispatch(reducers.network.closeRemoveAgenda()),
  }),
)(NetworkAgendasComponent);

export default NetworkAgendas;

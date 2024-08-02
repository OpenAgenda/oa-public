import { Component } from 'react';
import { connect } from 'react-redux';

import reducers from '../reducers';

import AddAgenda from '../components/AddAgenda';
import CreateAgenda from '../components/CreateAgenda';
import RemoveAgenda from '../components/RemoveAgenda';
import Canvas from '../components/Canvas';
import ListHead from '../components/ListHead';
import Loading from '../components/Loading';

export class NetworkAgendasComponent extends Component {
  componentDidMount() {
    const { onMount } = this.props;

    onMount();
  }

  render() {
    const {
      network: { agendas, add, create, remove },
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
          {add ? <AddAgenda onAdd={onAddSubmit} onClose={onAddClose} /> : null}
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
    onAddSubmit: (slugOrUrl) =>
      dispatch(reducers.network.submitAddAgenda(slugOrUrl)),
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

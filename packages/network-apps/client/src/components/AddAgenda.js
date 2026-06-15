import { Component } from 'react';
import { Modal } from '@openagenda/react-shared';

export default class AddAgenda extends Component {
  constructor(props) {
    super(props);

    const { credentialsSchema = {} } = props;

    // Pre-check credentials that default to ON in the schema, matching the admin
    // Features tab (which merges `def.default`). `official` defaults to true: the
    // headline use case for this modal is to officialize an agenda on add.
    this.state = {
      inputValue: '',
      official: true,
      credentials: Object.fromEntries(
        Object.entries(credentialsSchema).map(([key, def]) => [
          key,
          !!def.default,
        ]),
      ),
    };
  }

  toggleCredential(key, checked) {
    this.setState((state) => ({
      credentials: { ...state.credentials, [key]: checked },
    }));
  }

  render() {
    const { onClose, onAdd, credentialsSchema = {} } = this.props;
    const { inputValue, official, credentials } = this.state;

    return (
      <Modal onClose={onClose}>
        <p>
          Je n&apos;ai pas fait la recherche chiadée avec la dropdown. Alors
          pour le moment ce sera ce super champ où il faut mettre un url
          d&apos;agenda ( ou un slug )
        </p>
        <input
          onChange={(e) => this.setState({ inputValue: e.target.value })}
          type="text"
          className="form-control margin-bottom-sm"
          placeholder="Mettre un url ou un slug d'agenda"
        />

        <div className="checkbox margin-bottom-sm">
          <label>
            <input
              type="checkbox"
              checked={official}
              onChange={(e) => this.setState({ official: e.target.checked })}
            />{' '}
            Agenda officiel
          </label>
        </div>

        {Object.keys(credentialsSchema).length ? (
          <fieldset className="margin-bottom-sm">
            <legend>Fonctionnalités</legend>
            <ul className="list-unstyled">
              {Object.entries(credentialsSchema).map(([key, def]) => (
                <li key={key} className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!credentials[key]}
                      onChange={(e) =>
                        this.toggleCredential(key, e.target.checked)}
                    />{' '}
                    {def.description || key}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onAdd(inputValue, { official, credentials })}
        >
          Ajouter
        </button>
      </Modal>
    );
  }
}

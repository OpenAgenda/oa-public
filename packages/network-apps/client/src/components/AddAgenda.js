import { Component } from 'react';
import { Modal } from '@openagenda/react-shared';

export default class AddAgenda extends Component {
  constructor(props) {
    super(props);

    this.state = { inputValue: '' };
  }

  componentDidMount() {
    // not worthwile carrying this around
    this.state = { inputValue: '' };
  }

  render() {
    const { onClose, onAdd } = this.props;
    const { inputValue } = this.state;

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
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAdd.bind(null, inputValue)}
        >
          Ajouter
        </button>
      </Modal>
    );
  }
}

import React, { Component } from 'react';
import { Modal } from '@openagenda/react-shared';

export default class AddAgenda extends Component {

  constructor( props ) {

    super( props );

    this.state = { inputValue: '' };

  }

  componentDidMount() {

    // not worthwile carrying this around
    this.state = { inputValue: '' }

  }

  render() {

    const { onClose, onAdd } = this.props;

    return <Modal onClose={onClose}>
      <p>Je n'ai pas fait la recherche chiadée avec la dropdown. Alors pour le moment ce sera ce super champ où il faut mettre un url d'agenda ( ou un slug )</p>
      <input onChange={e => this.setState( { inputValue: e.target.value } ) } type="text" className="form-control margin-bottom-sm" placeholder="Mettre un url ou un slug d'agenda" />
      <button className="btn btn-primary" onClick={onAdd.bind( null, this.state.inputValue )}>Ajouter</button>
    </Modal>

  }

}

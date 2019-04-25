import React, { Component } from 'react';

import Modal from '@openagenda/react-components/build/Modal';

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

/*return <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={this.close.bind( this )}>

  <h3 className="margin-bottom-md">{getLabel( 'addField', lang )}</h3>

  { _.get( this, 'state.fieldType', null ) ?
    this.renderFieldForm()
    : <ChooseFieldType lang={lang} onChooseType={this.onChooseType.bind( this )} onCancel={this.close.bind( this )}/>  }

</Modal>*/

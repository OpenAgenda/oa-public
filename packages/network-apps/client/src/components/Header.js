import React, { Component } from 'react';

import Modal from '@openagenda/react-components/build/Modal';

export default props => {

  const { main } = props;

  return <div className="text-center margin-bottom-lg">
    <h1>Application de gestion des agendas</h1>
    { main.error ? <Modal>
      <label className="margin-v-sm">Il y a eu une erreur</label>
      <div className="margin-v-sm">
        <span>{main.error}</span>
      </div>
    </Modal> : null }
  </div>

}

import React, { Component } from 'react';

import Modal from '@openagenda/react-components/build/Modal';

export default ({ onClose, onRemove }) => <Modal onClose={onClose}>
  <div className="text-center">
    <p className="margin-v-sm">Retirer l'agenda du réseau?</p>
    <button className="btn btn-danger" onClick={onRemove}>Confirmer</button>
  </div>
</Modal>

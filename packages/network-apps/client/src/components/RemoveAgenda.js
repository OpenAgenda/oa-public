import { Modal } from '@openagenda/react-shared';

export default ({ onClose, onRemove }) => (
  <Modal onClose={onClose}>
    <div className="text-center">
      <p className="margin-v-sm">Retirer l&apos;agenda du réseau?</p>
      <button type="button" className="btn btn-danger" onClick={onRemove}>
        Confirmer
      </button>
    </div>
  </Modal>
);

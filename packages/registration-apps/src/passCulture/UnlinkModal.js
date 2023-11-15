import { Modal } from '@openagenda/react-shared';

export default function UnlinkModal({
  onClose,
  onConfirm,
  editPassHRef,
}) {
  return (
    <Modal
      onClose={onClose}
      classNames={{
        overlay: 'popup-overlay big',
      }}
      disableBodyScroll
    >
      <div className="margin-v-sm">
        <p><b>Retirer la référence d&apos;OpenAgenda ne supprimera pas l&apos;offre Pass Culture.</b></p>
        <p>La suppression complète de l&apos;offre doit être effectuée sur la plateforme du Pass. En cliquant sur confirmer, la référence de retirée sur votre fiche OpenAgenda et un onglet s&apos;ouvrira dans votre navigateur vers la gestion de votre offre sur la plateforme du pass qui vous permettra de procéder à sa suppression</p>
        <div className="text-center">
          <a
            rel="noreferrer"
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            target="_blank"
            href={editPassHRef}
          >
            Confirmer
          </a>
        </div>
      </div>
    </Modal>
  );
}

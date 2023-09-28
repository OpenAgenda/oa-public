import { Modal } from '@openagenda/react-shared';
import Form from './Form';

export default function FormModal({
  onClose,
  onSubmit,
  onClear,
  value,
  settings,
  timings,
}) {
  return (
    <Modal
      onClose={onClose}
      classNames={{
        overlay: 'popup-overlay big',
      }}
      disableBodyScroll
    >
      <div className="margin-v-md">
        <Form
          value={value}
          settings={settings}
          timings={timings}
          onSubmit={onSubmit}
          onClear={onClear}
        />
      </div>
    </Modal>
  );
}

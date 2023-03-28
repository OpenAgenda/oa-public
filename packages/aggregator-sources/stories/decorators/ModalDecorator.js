import { Modal } from '@openagenda/react-shared';

export default title => Story =>
  (
    <Modal
      classNames={{ overlay: 'popup-overlay big' }}
      title={title || 'A story'}
      onClose={() => {}}
    >
      <Story />
    </Modal>
  );

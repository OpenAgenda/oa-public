import { Modal } from '@openagenda/react-shared';
import Form from './Form';

export default function FormModal({
  onClose,
  onSubmit,
  onClear,
  value,
  categories,
  related,
  offererVenues,
  timings,
  location,
  title,
  longDesc,
  conditions,
  bookingEmail,
  patchMode,
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
          categories={categories}
          related={related}
          offererVenues={offererVenues}
          timings={timings}
          onSubmit={onSubmit}
          onClear={onClear}
          bookingEmail={bookingEmail}
          oaLocation={location}
          title={title}
          longDesc={longDesc}
          conditions={conditions}
          patchMode={patchMode}
        />
      </div>
    </Modal>
  );
}

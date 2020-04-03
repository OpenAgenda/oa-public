import React from 'react';
import Modal from '@openagenda/react-components/build/Modal';

export default title => storyFn => (
  <Modal
    classNames={{ overlay: 'popup-overlay big' }}
    title={title || 'A story'}
    onClose={() => {}}
  >
    {storyFn()}
  </Modal>
);

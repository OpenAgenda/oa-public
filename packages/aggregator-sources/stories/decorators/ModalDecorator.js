import React from 'react';
import Modal from '@openagenda/react-components/build/Modal';

export default storyFn => (
  <Modal
    classNames={{ overlay: 'popup-overlay big' }}
    title="New Rule story"
    onClose={() => {}}
  >
    {storyFn()}
  </Modal>
);

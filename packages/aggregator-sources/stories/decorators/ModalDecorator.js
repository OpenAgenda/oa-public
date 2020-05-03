import React from 'react';
import { Modal } from '@openagenda/react-components';

export default title => storyFn => (
  <Modal
    classNames={{ overlay: 'popup-overlay big' }}
    title={title || 'A story'}
    onClose={() => {}}
  >
    {storyFn()}
  </Modal>
);

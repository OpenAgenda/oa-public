import React from 'react';
import { action } from '@storybook/addon-actions';
import Modal from '../src/components/Modal';
import AdminCanvas from './decorators/AdminCanvas';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Modal',
  component: Modal,
  decorators: [AdminCanvas],
};

export const Simple = () => (
  <Modal
    title="Modal"
    onClose={action('close')}
    classNames={{ overlay: 'popup-overlay big' }}
    disableBodyScroll
  >
    <p>Hey I'm a modal</p>
  </Modal>
);

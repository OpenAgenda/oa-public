import React from 'react';
import { action } from '@storybook/addon-actions';
import Modal from '../src/Modal';
import Decorator from './helpers/Decorator';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Modal',
  component: Modal,
  decorators: [Decorator]
};

export const Simple = () => (
  <Modal
    title="Wahou"
    onClose={action('close')}
    classNames={{ overlay: 'popup-overlay big' }}
    disableBodyScroll
  >
    <p>Wahou, je suis bluffé</p>
    <img src="http://m.memegen.com/fptbj1.jpg" alt="wahou" style={{ maxWidth: '100%' }} />
  </Modal>
);

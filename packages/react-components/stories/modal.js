import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import Modal from '../components/Modal';
import Decorator from './helpers/Decorator';

import '@openagenda/bs-templates/compiled/main.css';

storiesOf( 'Modal', module )
  .addDecorator( Decorator )
  .add( 'Simple', () => (

    <Modal
      title="Wahou"
      onClose={action('close')}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <p>Wahou, je suis bluffé</p>
      <img src="http://m.memegen.com/fptbj1.jpg" alt="wahou" style={{ maxWidth: '100%' }} />
    </Modal>

  ) )

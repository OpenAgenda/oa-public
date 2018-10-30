import React from 'react';
import { storiesOf } from '@storybook/react';
import MoreInfo from '../components/MoreInfo';
import Decorator from './helpers/Decorator';

import '@openagenda/bs-templates/compiled/main.css';

storiesOf( 'MoreInfo', module )
  .addDecorator( Decorator )
  .add( 'Simple', () => (

    <MoreInfo
      id="first-popover"
      content="N'importe quoi par là"
    />

  ) )
  .add( 'Title and text content', () => (

    <MoreInfo
      id="second-popover"
      title="Un petit titre ici"
      content="N'importe quoi par là"
      placement="bottom"
    />

  ) )
  .add( 'With a link', () => (

    <MoreInfo
      id="third-popover"
      title="Un petit titre ici"
      content="N'importe quoi par là"
      link="https://openagenda.zendesk.com/"
      placement="left"
    />

  ) )
  .add( 'Wrapping a component', () => (

    <MoreInfo
      id="fourth-popover"
      content="Ce badge est un badge !"
    >
      <div className="badge">Un badge !</div>
    </MoreInfo>

  ) );

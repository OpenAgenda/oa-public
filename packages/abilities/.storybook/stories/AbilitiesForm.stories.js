import React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';

import AbilitiesForm from '../../src/client/AbilitiesForm';


function withJestSleep( ms = 1 ) {
  return element => (
    process.env.STORYBOOK_MODE === 'test'
      ? {
        element,
        jestWaitTime: ms
      }
      : element
  );
}

storiesOf( 'AbilitiesForm', module )
// .add( 'with text', () => (
//   <button type="button" onClick={action( 'clicked' )}>
//     Hello Button
//   </button>
// ) )
// .add( 'with some emoji', () => (
//   <button type="button" onClick={action( 'clicked' )}>
//     <span role="img" aria-label="so cool">😀 😎 👍 💯</span>
//   </button>
// ) )
  .add( 'for a user', () => withJestSleep( 1500 )(
    <AbilitiesForm
      entityName="user"
      identifier={99999999}
      res={{
        getFormIndex: `http://localhost:${process.env.STORYBOOK_API_PORT}/abilities/form-index`
      }}
    />
  ) );
